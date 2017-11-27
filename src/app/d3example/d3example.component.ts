import { Component, ElementRef, NgZone, OnDestroy, OnInit } from '@angular/core';
//import * as data from '../../../data/elements_by_episode.json';

import {
  D3Service,
  D3,
  Axis,
  BrushBehavior,
  BrushSelection,
  D3BrushEvent,
  ScaleLinear,
  ScaleOrdinal,
  LinkRadial,
  Selection,
  Transition
} from 'd3-ng2-service';
//import { relative } from 'path';
import { Http } from '@angular/http/src/http';
import { Map } from 'd3-ng2-service/src/bundle-d3';


@Component({
  selector: 'app-d3example',
  template: '<svg width="200" height="200"></svg>', 
  //templateUrl: './d3example.component.html',
  styleUrls: ['./d3example.component.css']
})
export class D3exampleComponent implements OnInit {
 
  private d3: D3;
  private parentNativeElement: any;
  private d3Svg: Selection<SVGSVGElement, any, null, undefined>;
  private allData;

  constructor(element: ElementRef, private ngZone: NgZone, d3Service: D3Service) {
    this.d3 = d3Service.getD3();
    this.parentNativeElement = element.nativeElement;
    // this.http.get('data/data.json')
    //     .subscribe(res => this.allData = res.json());
  }


  ngOnInit() {

    let d3ParentElement: any;

    
    var data: any = [[120, ["like", "call response", "dramatic intro", "has breaks", "male vocalist", "silly", "swing"]], [150, ["brassy", "like", "calm energy", "female vocalist", "swing", "fun"]], [170, ["calm energy", "instrumental", "swing", "like", "happy"]], [140, ["has breaks", "male vocalist", "swing", "piano", "banjo", "chill"]], [160, ["calm energy", "instrumental", "swing", "like", "interesting"]], [140, ["brassy", "like", "energy", "dramatic intro", "male vocalist", "baseball", "swing"]], [170, ["instrumental", "interesting", "high energy", "like", "swing"]], [140, ["instrumental", "energy", "like", "swing"]], [200, ["instrumental", "brassy", "dramatic intro", "like", "swing"]], [160, ["male vocalist", "brassy", "swing", "like", "my favorites"]], [130, ["like", "interesting", "dramatic intro", "male vocalist", "silly", "swing", "gospel"]], [160, ["like", "long intro", "announcer", "energy", "swing", "female vocalist"]], [170, ["instrumental", "swing", "bass", "like"]], [150, ["like", "interesting", "has breaks", "instrumental", "chunky", "swing", "banjo", "trumpet"]], [170, ["like", "has breaks", "male vocalist", "silly", "swing", "banjo"]], [190, ["instrumental", "banjo", "swing"]], [130, ["instrumental", "brassy", "banjo", "like", "swing"]], [160, ["brassy", "like", "energy", "instrumental", "big band", "jam", "swing"]], [150, ["like", "male vocalist", "live", "swing", "piano", "banjo", "chill"]], [150, ["like", "trick ending", "instrumental", "chunky", "swing", "chill"]], [120, ["brassy", "like", "female vocalist", "swing", "chill", "energy buildup"]], [150, ["brassy", "like", "interesting", "instrumental", "swing", "piano"]], [190, ["brassy", "like", "long intro", "energy", "baseball", "swing", "female vocalist"]], [180, ["calm energy", "female vocalist", "live", "like", "swing"]], [200, ["banjo", "like", "long intro", "interesting", "energy", "my favorites", "male vocalist", "silly", "swing", "fun", "balboa"]], [150, ["brassy", "calm energy", "chunky", "instrumental", "old-timey", "live", "swing"]], [160, ["like", "call response", "interesting", "instrumental", "calm energy", "swing"]], [180, ["interesting", "swing", "fast", "male vocalist"]], [150, ["calm energy", "chunky", "swing", "female vocalist", "like"]], [180, ["like", "has breaks", "male vocalist", "chunky", "silly", "swing"]], [140, ["instrumental", "brassy", "dramatic intro", "swing", "chill"]], [150, ["male vocalist", "trumpet", "like", "swing"]], [150, ["instrumental", "energy", "like", "has breaks", "swing"]], [180, ["brassy", "like", "energy", "has breaks", "instrumental", "has calm", "swing"]], [150, ["female vocalist", "swing"]], [170, ["instrumental", "brassy", "energy", "swing"]], [170, ["calm energy", "instrumental", "energy", "like", "swing"]], [190, ["brassy", "like", "instrumental", "high energy", "swing", "trumpet"]], [160, ["male vocalist", "energy", "swing", "old-timey"]], [170, ["like", "oldies", "my favorites", "fast", "male vocalist", "high energy", "swing"]]];
    
    var outer: any = this.d3.map();
    var inner = [];
    var links = [];
    

    var outerId = [0];


    data.forEach(function(d){
        
        if (d == null)
            return;
        
        var i: {related_nodes: any, id: any, name: any, related_links: any} = { id: 'i' + inner.length, name: d[0], related_links: [], related_nodes: [] };
        i.related_nodes = [i.id];
        inner.push(i);
        
        if (!Array.isArray(d[1]))
            d[1] = [d[1]];
        
        d[1].forEach(function(d1){
            
            var o: any;
            o = outer.get(d1);
            
            if (o == null)
            {
                o = { name: d1,	id: 'o' + outerId[0], related_links: [] };
                o.related_nodes = [o.id];
                outerId[0] = outerId[0] + 1;	
                
                outer.set(d1, o);
            }
            
            // create the links
            var l = { id: 'l-' + i.id + '-' + o.id, inner: i, outer: o }
            links.push(l);
            
            // and the relationships
            i.related_nodes.push(o.id);
            i.related_links.push(l.id);
            o.related_nodes.push(i.id);
            o.related_links.push(l.id);

            console.log("i: ", i);
            console.log("o: ", o);
        });
    });



    data = {
        inner: inner,
        outer: outer.values(),
        links: links
    }

    // sort the data -- TODO: have multiple sort options
    outer = data.outer;
    data.outer = Array(outer.length);


    var i1 = 0;
    var i2 = outer.length - 1;

    for (var i = 0; i < data.outer.length; ++i)
    {
        if (i % 2 == 1)
            data.outer[i2--] = outer[i];
        else
            data.outer[i1++] = outer[i];
    }

    console.log(data.outer.reduce(function(a,b) { return a + b.related_links.length; }, 0) / data.outer.length);


    // from d3 colorbrewer: 
    // This product includes color specifications and designs developed by Cynthia Brewer (http://colorbrewer.org/).
    var colors = ["#a50026","#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"]
    var color = this.d3.scaleLinear()
        .domain([10, 220])
        .range([colors.length-1, 0])
        .clamp(true);

    var diameter = 960;
    var rect_width = 60;
    var rect_height = 14;

    var link_width = "1px"; 

    var il = data.inner.length;
    var ol = data.outer.length;

    console.log("Here: ", il," and " , ol);
    console.log("Map: "+ this.d3);

    var inner_y = this.d3.scaleLinear()
        .domain([0, il])
        .range([-(il * rect_height)/2, (il * rect_height)/2]);

    var mid: any = (data.outer.length/2.0)
    var outer_x = this.d3.scaleLinear()
        .domain([0, mid, mid, data.outer.length])
        .range([15, 170, 190 ,355]);

    var outer_y = this.d3.scaleLinear()
        .domain([0, data.outer.length])
        .range([0, diameter / 2 - 120]);


    // setup positioning
    data.outer = data.outer.map(function(d, i) { 
        d.x = outer_x(i);
        d.y = diameter/3;
        return d;
    });

    data.inner = data.inner.map(function(d, i) { 
        d.x = -(rect_width / 2);
        d.y = inner_y(i);
        return d;
    });


    function get_color(name)
    {
        var c = Math.round(color(name));
        if (isNaN(c))
            return '#dddddd';	// fallback color
        
        return colors[c];
    }

    // Can't just use d3.svg.diagonal because one edge is in normal space, the
    // other edge is in radial space. Since we can't just ask d3 to do projection
    // of a single point, do it ourselves the same way d3 would do it.  


    function projectX(x)
    {
        return ((x - 90) / 180 * Math.PI) - (Math.PI/2);
    }

    // var diagonal = this.d3.svg.diagonal()
    //     .source(function(d) { return {"x": d.outer.y * Math.cos(projectX(d.outer.x)), 
    //                                 "y": -d.outer.y * Math.sin(projectX(d.outer.x))}; })            
    //     .target(function(d) { return {"x": d.inner.y + rect_height/2,
    //                                 "y": d.outer.x > 180 ? d.inner.x : d.inner.x + rect_width}; })
    //     .projection(function(d) { return [d.y, d.x]; });


    console.log("Map now: ", this.d3);

    var svg = this.d3.select("body").append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .append("g")
        .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

    console.log("Map selection now: ", this.d3.selectAll);    
    console.log("Svg: ", svg);

    // links
    // var link = this.d3.linkHorizontal()
    //         .x(function(d) { return d.y; })
    //         .y(function(d) { return d.x; });

    // var link = this.d3.linkRadial()
    // .angle(function(d) { return d.x; })
    // .radius(function(d) { return d.y; });

    var link = svg.append('g').attr('class', 'links').selectAll(".link")
        .data(data.links)
        .enter().append('path')
        .attr('class', 'link')
        .attr('id', function(d) { return d.id })
        //.attr("d", diagonal)
        // .attr("d", this.d3.linkHorizontal()
        //         .x(function(d) { console.log("D: ",d); return d.y; })
        //         .y(function(d) { console.log("D: ",d); return d.x; }))
        // .attr("d", this.d3.linkHorizontal()
        //             .x(function(d) { return {"x": d.outer.y * Math.cos(projectX(d.outer.x)), 
        //                                      "y": -d.outer.y * Math.sin(projectX(d.outer.x))}; })
        //             .y(function(d) { return {"x": d.inner.y + rect_height/2,
        //                                     "y": d.outer.x > 180 ? d.inner.x : d.inner.x + rect_width}; })

        .attr('stroke', function(d) { return get_color(d.inner.name); })
        .attr('stroke-width', link_width);

    // outer nodes

    var onode = svg.append('g').selectAll(".outer_node")
        .data(data.outer)
        .enter().append("g")
        .attr("class", "outer_node")
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);
    
    onode.append("circle")
        .attr('id', function(d) { return d.id })
        .attr("r", 4.5);
    
    onode.append("circle")
        .attr('r', 20)
        .attr('visibility', 'hidden');
    
    onode.append("text")
        .attr('id', function(d) { return d.id + '-txt'; })
        .attr("dy", ".31em")
        .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
        .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
        .text(function(d) { return d.name; });
    
    // inner nodes
    
    var inode = svg.append('g').selectAll(".inner_node")
        .data(data.inner)
        .enter().append("g")
        .attr("class", "inner_node")
        .attr("transform", function(d, i) { return "translate(" + d.x + "," + d.y + ")"})
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);
    
    inode.append('rect')
        .attr('width', rect_width)
        .attr('height', rect_height)
        .attr('id', function(d) { return d.id; })
        .attr('fill', function(d) { return get_color(d.name); });
    
    inode.append("text")
        .attr('id', function(d) { return d.id + '-txt'; })
        .attr('text-anchor', 'middle')
        .attr("transform", "translate(" + rect_width/2 + ", " + rect_height * .75 + ")")
        .text(function(d) { return d.name; });

    // need to specify x/y/etc

    console.log("And now: ", this.d3.select);
    this.d3.select(self.frameElement).style("height", diameter - 150 + "px");
    console.log("And now: ", this.d3.select);

    function mouseover(d) {
        console.log("Mouse over! ", d);
        console.log("Mouse over d3 ", this.d3);
        // bring to front
        // WHY IS THIS STUPID LINE PROBLEM? 
        this.d3.selectAll('.links .link').sort(function(a, b){ return d.related_links.indexOf(a.id); });	
       
        // for (var i = 0; i < d.related_nodes.length; i++)
        // {
        //     this.d3.select('#' + d.related_nodes[i]).classed('highlight', true);
        //     this.d3.select('#' + d.related_nodes[i] + '-txt').attr("font-weight", 'bold');
        // }
        
        // for (var i = 0; i < d.related_links.length; i++)
        //     this.d3.select('#' + d.related_links[i]).attr('stroke-width', '5px');
    }

    function mouseout(d)
    {   	
        for (var i = 0; i < d.related_nodes.length; i++)
        {
            this.d3.select('#' + d.related_nodes[i]).classed('highlight', false);
            this.d3.select('#' + d.related_nodes[i] + '-txt').attr("font-weight", 'normal');
        }
        
        for (var i = 0; i < d.related_links.length; i++)
            this.d3.select('#' + d.related_links[i]).attr('stroke-width', link_width);
    }

  }
}




///*****************

// import { Component, ElementRef, NgZone, OnDestroy, OnInit } from '@angular/core';

// import {
//   D3Service,
//   D3,
//   Axis,
//   BrushBehavior,
//   BrushSelection,
//   D3BrushEvent,
//   ScaleLinear,
//   ScaleOrdinal,
//   Selection,
//   Transition
// } from 'd3-ng2-service';


// @Component({
//   selector: 'app-d3example',
//   template: '<svg width="200" height="200"></svg>', 
//   //templateUrl: './d3example.component.html',
//   //styleUrls: ['./d3example.component.css']
// })
// export class D3exampleComponent implements OnInit {
 
//   private d3: D3;
//   private parentNativeElement: any;
//   private d3Svg: Selection<SVGSVGElement, any, null, undefined>;

//   constructor(element: ElementRef, private ngZone: NgZone, d3Service: D3Service) {
//     this.d3 = d3Service.getD3();
//     this.parentNativeElement = element.nativeElement;
//   }

//   ngOnInit() {
//     let self = this;
//     let d3 = this.d3;
//     let d3ParentElement: any;
//     let svg: any;
//     let name: string;
//     let yVal: number;
//     let colors: any = [];
//     let data: {name: string, yVal: number}[] = [];
//     let padding: number = 25;
//     let width: number = 500;
//     let height: number = 150;
//     let xScale: any;
//     let yScale: any;
//     let xColor: any;
//     let xAxis: any;
//     let yAxis: any;

//     if (this.parentNativeElement !== null) {
//     svg = d3.select(this.parentNativeElement)
//       .append('svg')        // create an <svg> element
//       .attr('width', width) // set its dimensions
//       .attr('height', height);

//     colors = ['red', 'yellow', 'green', 'blue'];

//     data = [
//       {name : 'A', yVal : 1},
//       {name : 'B', yVal : 4},
//       {name : 'C', yVal : 2},
//       {name : 'D', yVal : 3}
//     ];

//     xScale = d3.scaleBand()
//       .domain(data.map(function(d){ return d.name; }))
//       .range([0, 200]);

//     yScale = d3.scaleLinear()
//       .domain([0,d3.max(data, function(d) {return d.yVal})])
//       .range([100, 0]);

//     xAxis = d3.axisBottom(xScale) // d3.js v.4
//       .ticks(5)
//       .scale(xScale);

//     yAxis = d3.axisLeft(xScale) // d3.js v.4
//       .scale(yScale)
//       .ticks(7);

//     svg.append("g")
//     .attr("class", "axis")
//     .attr("transform", "translate(" + (padding) + "," + padding + ")")
//     .call(yAxis);

//     svg.append('g')            // create a <g> element
//     .attr('class', 'axis')   // specify classes
//     .attr("transform", "translate(" + padding + "," + (height - padding) + ")")
//     .call(xAxis);            // let the axis do its thing

//     var rects = svg.selectAll('rect')
//       .data(data);
//       rects.size();

//     var newRects = rects.enter();

//     newRects.append('rect')
//       .attr('x', function(d,i) {
//         return xScale(d.name );
//       })
//       .attr('y', function(d) {
//           return yScale(d.yVal);
//         })
//       .attr("transform","translate(" + (padding -5  + 25) + "," + (padding - 5) + ")")
//       .attr('height', function(d) {
//           return height - yScale(d.yVal) - (2*padding) + 5})
//       .attr('width', 10)
//       .attr('fill', function(d, i) {
//         return colors[i];
//       });
//     }
//   }
// }
