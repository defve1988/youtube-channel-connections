
class force_graph {
    constructor(div_name, file) {
        this.height = 1500
        this.width = 2000
        this.highlight_color = "#e02914";
        this.normal_color = "black";
        this.div_name = div_name
        this.svg = d3.select(this.div_name).attr("viewBox", [0, 0, this.width, this.height]);
        this.file = file
    }

    async init() {
        var data = await d3.json(this.file)
        this.graph = await this.creat_net(data)
        this.linkedByIndex = this.graph.linkedByIndex
        await this.init_simulation()
        await this.set_scale()
        await this.draw(this.graph.nodes, this.graph.links)
        await this.set_actions()
        // console.log(this.graph.links.length)
    }

    async update() {
        var data = await d3.json(this.file)
        graph = await this.creat_net(data)
    }

    async draw(nodes, links) {
        this.svg.selectAll("g").remove()
        this.g = this.svg.append("g")
            .attr("class", "everything");

        this.link = this.g.append("g")
            .attr("class", "links")
            .selectAll("path")
            .data(links)
            .join(enter => enter.append("line"))
            // .enter().append("line")
            .attr("stroke", this.normal_color)
            .attr("stroke-width", d => this.strokeScale(Math.log10(d.value)))
            .attr("stroke-opacity", 0.6);

        this.link_text = this.g.append("g").selectAll("g")
            .data(links)
            .join(enter => enter.append("text"))
            .style("pointer-events", "none")
            .attr('class', 'edgelabel')
            .attr('id', function (d, i) {return 'edgelabel' + i})
            .attr('font-size', 10)
            .attr('fill', '#aaa')
            .append('textPath')
            .attr('xlink:href', function (d, i) {return '#edgepath' + i})
            .style("text-anchor", "middle")
            .attr("startOffset", "50%")
            .text(d => d.value);

        this.node = this.g.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(nodes)
            .join(enter => enter.append("circle"))
            // .enter()
            // .append("circle")
            .attr("class", "node")
            .attr("r", d => this.sizeScale(Math.log10(d.watched)))
            .attr("fill", d => this.colorScale(Math.log10(d.subscribers)))
            .attr("stroke", d => d.isStart ? "orangered" : d => this.colorScale(Math.log10(d.subscribers)))
            .style("stroke-width", d => d.isStart ? 4.5 : 1.5);

        this.text = this.g.append("g").attr("class", "labels").selectAll("g")
            .data(nodes)
            .join(enter => enter.append("text"))
            // .enter().append("g")
            // .append("text")
            .attr("x", d => this.sizeScale(Math.log10(d.watched)))
            .attr("y", 0)
            .style("text-anchor", "left")
            .style("font-weight", d => {
                var temp = this.textScale(Math.log10(d.watched));
                var weight = "normal";
                if (temp > 18) weight = "bold";
                if (temp < 10) weight = "lighter";
                return weight
            })
            .style("font-family", "sans-serif")
            .style("font-size", d => this.textScale(Math.log10(d.watched)))
            .style("fill", d => this.colorScale(Math.log10(d.subscribers)))
            .text(function (d) { return d.id; });

        this.node.append("title")
            .text(function (d) { return d.id; });
    }

    async set_actions() {
        this.node.on("dblclick.zoom", function (d) { d3.event.stopPropagation(); })
            .on("mouseover", d => {
                d.mouseover = true
                this.node.style("fill", o => { return this.isConnected(d, o) || o.fixed ? this.highlight_color : this.colorScale(Math.log10(o.subscribers)) })
                this.text
                    .text(o => { return o.mouseover || o.fixed ? o.id + " (" + parseInt(o.subscribers / 1000) + "K)" : o.id })
                    .style("fill", o => { return this.isConnected(d, o) || o.fixed ? this.highlight_color : this.colorScale(Math.log10(o.subscribers)) });
                this.link.style("stroke", o => { return o.source.id == d.id || o.target.id == d.id ? this.highlight_color : this.normal_color });
            })
            .on("mouseleave", d => {
                d.mouseover = false
                this.node.style("fill", o => { return o.fixed ? this.highlight_color : this.colorScale(Math.log10(o.subscribers)) });
                this.text
                    .text(o => { return o.mouseover || o.fixed ? o.id + " (" + parseInt(o.subscribers / 1000) + "K)" : o.id })
                    .style("fill", o => { return o.fixed ? this.highlight_color : this.colorScale(Math.log10(o.subscribers)) });
                this.link.style("stroke", this.normal_color);
            }
            )
            .on("mouseup", () => {
                this.node.style("opacity", 1)
                this.text.style("opacity", 1);
                this.link.style("stroke-opacity", 0.6);
            })
            .on("mousedown", d => {
                d3.event.stopPropagation();
                var leftButtonPressed = (d3.event.button === 0);
                if (leftButtonPressed) {
                    if (d3.event.ctrlKey) {
                        if (d.fixed == false) {
                            d.fixed = true;
                            d.fx = d.x;
                            d.fy = d.y;
                        }
                        else {
                            d.fixed = false;
                            d.fx = null;
                            d.fy = null;
                        }
                    }
                    this.node.style("opacity", o => { return this.isConnected(d, o) || o.fixed ? 1 : 0.1 })
                    this.text.style("opacity", o => { return this.isConnected(d, o) || o.fixed ? 1 : 0.1 });
                    this.link.style("stroke-opacity", o => { return o.source.id == d.id || o.target.id == d.id ? 0.6 : 0.1 });
                }
            });
        this.drag_handler = d3.drag()
            .on("start", d => {
                if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on("drag", d => {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            })
            .on("end", d => {
                // if (!d3.event.active) this.simulation.alphaTarget(0);
                if (d.fixed == true) {
                    d.fx = d.x;
                    d.fy = d.y;
                }
                else {
                    // d.fx = d3.event.x;
                    // d.fy = d3.event.y;
                    d.fx = null;
                    d.fy = null;
                }
                this.node.style("opacity", 1)
                this.text.style("opacity", 1);
                this.link.style("stroke-opacity", 0.6);
            });

        this.drag_handler(this.node);

        this.zoom_handler = d3.zoom()
            .on("zoom", () => {
                this.g.attr("transform", d3.event.transform)
            });
        this.zoom_handler(this.svg);
    }

    async set_scale() {
        this.sizeScale = d3.scaleLinear()
            .domain([0, Math.log10(this.graph.max_node)])
            .range([2, 25]);

        this.colorScale = d3.scaleLinear().domain([0, Math.log10(this.graph.max_subscribers)])
            .range(["blue", this.normal_color]);

        this.strokeScale = d3.scaleLinear()
            .domain([0, Math.log10(this.graph.max_links)])
            .range([0.5, 10]);

        this.textScale = d3.scaleLinear()
            .domain([0, Math.log10(this.graph.max_node)])
            .range([8, 25]);
    }

    async init_simulation() {
        this.simulation = d3.forceSimulation()
            .nodes(this.graph.nodes);

        this.simulation
            .force("charge_force", d3.forceManyBody().strength(-200))
            .force("center_force", d3.forceCenter(this.width / 2, this.height / 2))
            .force("links", d3.forceLink(this.graph.links).id(function (d) { return d.id; }))
            .force("collide", d3.forceCollide().radius(10))
            ;
        this.simulation
            .on("tick", () => {
                //update circle positions each tick of the simulation 
                this.node
                    .attr("cx", function (d) { return d.x; })
                    .attr("cy", function (d) { return d.y; });

                //update link positions 
                this.link
                    .attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return d.target.x; })
                    .attr("y2", function (d) { return d.target.y; });

                this.text
                    .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
            });

    }

    async creat_net(data) {
        var node_name = []
        var nodes = []
        var links = []
        var linkedByIndex = {}

        var watch_threshold = 2
        var link_threshold = 0

        var max_node = 0
        var max_links = 0
        var max_subscribers = 0

        for (const [youtuber, content] of Object.entries(data.nodes)) {
            if (content.watched > watch_threshold) {
                var temp_node = content
                temp_node.fixed = false
                temp_node.mouseover = false
                nodes.push(temp_node)
                node_name.push(youtuber)
            }
            if (content.watched > max_node) max_node = content.watched
            if (content.subscribers > max_subscribers) max_subscribers = content.subscribers
        }
        for (const [link, content] of Object.entries(data.links)) {
            if (content.value > link_threshold) {
                if (node_name.includes(content.source) && node_name.includes(content.target)) {
                    links.push(content)
                    linkedByIndex[link] = true
                }
            }
            if (content.value > max_links) max_links = content.value
        }

        return {
            links: links,
            nodes: nodes,
            max_node: max_node,
            max_links: max_links,
            max_subscribers: max_subscribers,
            linkedByIndex: linkedByIndex
        }

    }

    isConnected(a, b) {
        return this.linkedByIndex[a.id + "-" + b.id] || this.linkedByIndex[b.id + "-" + a.id] || a.id == b.id;
    }

}

f = new force_graph('#my_viz', 'channel_graph.json')
f.init()
// setInterval(function () {
//     f.init();
// }, 5000);