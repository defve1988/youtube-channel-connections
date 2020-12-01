
class force_graph {
    constructor(div_name, file, watch_threshold = 0, link_threshold = 0) {
        this.watch_threshold = watch_threshold
        this.link_threshold = link_threshold
        this.height = 1080
        this.width = 1920
        this.highlight_color = "#e02914";
        this.normal_color = "black";
        this.max_size = 25
        this.max_stroke_width = 10
        this.height_text = this.max_size*0.75;
        this.div_name = div_name
        this.svg = d3.select(this.div_name).attr("viewBox", [0, 0, this.width, this.height]);
        this.file = file
    }

    async init_data(file = this.file) {
        var data = await d3.json(file)
        this.graph = await this.creat_net(data)
        this.linkedByIndex = this.graph.linkedByIndex
    }

    async init() {
        await this.init_data()
        await this.init_simulation()
        await this.set_scale()
        await this.draw(this.graph.nodes, this.graph.links)
        await this.set_actions()
        // await this.set_legend()
        document.getElementById("total_channel").innerText = this.graph.total
        // console.log(this.graph.links.length)
    }

    async set_legend() {
        this.svg
            .append("circle")
            .attr("cx", 30)
            .attr("cy", 30)
            .attr("r", 5)
            .style("fill", "#69b3a2")
        this.svg
            .append("circle")
            .attr("cx", 30)
            .attr("cy", 50)
            .attr("r", 25)
            .style("fill", "#69b3a2")

    }

    async set_scale() {
        this.sizeScale = d3.scaleLinear()
            .domain([Math.log10(this.graph.min_node), Math.log10(this.graph.max_node)])
            .range([5, this.max_size]);

        this.colorScale = d3.scaleLinear().domain([0, Math.log10(this.graph.max_subscribers)])
            .range([this.normal_color, this.normal_color]);

        this.strokeScale = d3.scaleLinear()
            .domain([0, Math.log10(this.graph.max_links)])
            .range([0.5, this.max_stroke_width]);

        this.textScale = d3.scaleLinear()
            .domain([Math.log10(this.graph.min_node), Math.log10(this.graph.max_node)])
            .range([8, this.max_size]);
    }

    async draw(nodes, links) {
        console.log(1)
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
            .attr('id', function (d, i) { return 'edgelabel' + i })
            .attr('font-size', 10)
            .attr('fill', '#aaa')
            .append('textPath')
            .attr('xlink:href', function (d, i) { return '#edgepath' + i })
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
            // .attr("opacity", 0.6)
            .attr("stroke", d => d.isStart ? "orangered" : d => this.colorScale(Math.log10(d.subscribers)))
            .style("stroke-width", d => d.isStart ? 2.5 : 0.5);

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
            .attr("opacity", d=> this.sizeScale(Math.log10(d.watched)) > this.height_text ? 1 : 0.4)
            .text(d => d.id);

        this.node.append("title")
            .text(function (d) { return d.id; });
    }

    async set_actions() {
        this.node.on("dblclick.zoom", function (event, d) { event.stopPropagation(); })
            .on("mouseover", (event, d) => {
                d.mouseover = true
                this.node.style("fill", o => { return this.isConnected(d, o) || o.fixed ? this.highlight_color : this.colorScale(Math.log10(o.subscribers)) })
                this.text
                    .text(o => { return o.mouseover || o.fixed ? o.id + " (" + parseInt(o.subscribers / 1000) + "K)" : o.id })
                    .style("fill", o => { return this.isConnected(d, o) || o.fixed ? this.highlight_color : this.colorScale(Math.log10(o.subscribers)) })
                    .style("opacity", o => { return this.isConnected(d, o) || o.fixed ? 1 : 0.3 });
                this.link.style("stroke", o => { return o.source.id == d.id || o.target.id == d.id ? this.highlight_color : this.normal_color });
                var total_in = []
                var total_out = []
                var total_self = 0
                this.graph.links.map(x => {
                    if (x.source.id == d.id && x.target.id == d.id) total_self = x.value
                    else {
                        if (x.source.id == d.id && !total_out.includes(x.target.id)) total_out.push(x.target.id)
                        if (x.target.id == d.id && !total_in.includes(x.source.id)) total_in.push(x.source.id)
                    }
                })
                // console.log(total_self)
                // refers itself for <b>"+ total_self+"</b> times, it
                document.getElementById("report").innerHTML = "<b>" + d.id + "</b> is refered by <b>" + total_in.length + "</b> channels, and it refers <b>" + total_out.length + "</b> channels."


            })
            .on("mouseleave", (event, d) => {
                d.mouseover = false
                this.node.style("fill", o => { return o.fixed ? this.highlight_color : this.colorScale(Math.log10(o.subscribers)) });
                this.text
                    .text(o => { return o.mouseover || o.fixed ? o.id + " (" + parseInt(o.subscribers / 1000) + "K)" : o.id })
                    .style("fill", o => { return o.fixed ? this.highlight_color : this.colorScale(Math.log10(o.subscribers)) })
                    .style("opacity", d=> this.sizeScale(Math.log10(d.watched)) > this.height_text ? 1 : 0.4);
                this.link.style("stroke", this.normal_color);
                document.getElementById("report").innerText = ""
            }
            )
            .on("mouseup", (event, d) => {
                this.node.style("opacity", 1)
                this.text.style("opacity", d=> this.sizeScale(Math.log10(d.watched)) > this.height_text ? 1 : 0.4);
                this.link.style("stroke-opacity", 0.6);
            })
            .on("mousedown", (event, d) => {
                event.stopPropagation();
                var leftButtonPressed = (event.button === 0);
                if (leftButtonPressed) {
                    if (event.ctrlKey) {
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
            .on("start", (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on("drag", (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on("end", (event, d) => {
                // if (!event.active) this.simulation.alphaTarget(0);
                if (d.fixed == true) {
                    d.fx = d.x;
                    d.fy = d.y;
                }
                else {
                    // d.fx = event.x;
                    // d.fy = event.y;
                    d.fx = null;
                    d.fy = null;
                }
                this.node.style("opacity", 1)
                this.text.style("opacity", 1);
                this.link.style("stroke-opacity", 0.6);
            });

        this.drag_handler(this.node);

        this.zoom_handler = d3.zoom()
            .on("zoom", (event, d) => {
                this.g.attr("transform", event.transform)
            });
        this.zoom_handler(this.svg);
    }

    async init_simulation() {
        this.simulation = d3.forceSimulation()
            .nodes(this.graph.nodes);

        this.simulation
            .force("charge_force", d3.forceManyBody().strength(-200))
            .force("center_force", d3.forceCenter(this.width / 2, this.height / 2))
            .force("links", d3.forceLink(this.graph.links).id(function (d) { return d.id; }))
            // .force("collide", d3.forceCollide().radius(10))
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
        var total = 0
        var max_node = 0
        var min_node = 99999
        var max_links = 0
        var min_links = 99999
        var max_subscribers = 0
        var min_subscribers = 99999

        for (const [youtuber, content] of Object.entries(data.nodes)) {
            if (content.watched >= this.watch_threshold) {
                var temp_node = content
                temp_node.fixed = false
                temp_node.mouseover = false
                nodes.push(temp_node)
                node_name.push(youtuber)
                total += 1
                if (content.watched > max_node) max_node = content.watched
                if (content.subscribers > max_subscribers) max_subscribers = content.subscribers
                if (content.watched < min_node) min_node = content.watched
                if (content.subscribers < min_subscribers) min_subscribers = content.subscribers
            }

        }
        for (const [link, content] of Object.entries(data.links)) {
            var reverse_link = content.target + '-' + content.source
            var link_val = content.value
            if (data.links[reverse_link] != undefined) {
                link_val += data.links[reverse_link].value
            }
            if (link_val >= this.link_threshold) {
                if (node_name.includes(content.source) && node_name.includes(content.target)) {
                    links.push(content)
                    linkedByIndex[link] = true
                    if (content.value > max_links) max_links = content.value
                    if (content.value < min_links) min_links = content.value
                }
            }
        }

        return {
            links: links,
            nodes: nodes,
            max_node: max_node,
            min_node: min_node,
            max_links: max_links,
            min_links: min_links,
            max_subscribers: max_subscribers,
            min_subscribers: min_subscribers,
            linkedByIndex: linkedByIndex,
            total: total
        }

    }

    isConnected(a, b) {
        return this.linkedByIndex[a.id + "-" + b.id] || this.linkedByIndex[b.id + "-" + a.id] || a.id == b.id;
    }

}


function draw() {
    var watch_threshold = document.getElementById("node_thres").value
    // var link_threshold = document.getElementById("link_thres").value
    var link_threshold = 0

    var file_list = Array(100).fill(0)
    // file_list = file_list.map((i, index) => '/data/channel_graph_' + index+1 + '.json')
    var index = 0
    f = new force_graph('#my_viz', "/data/channel_graph_100_2.json", watch_threshold, link_threshold)
    f.init()
    // setInterval(function () {
    //     index += 1
    //     f = new force_graph('#my_viz', file_list[index])
    //     f.init()
    // }, 2000);
}

draw()