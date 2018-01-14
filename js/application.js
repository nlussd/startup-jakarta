require([
  "esri/Map",
  "esri/layers/FeatureLayer",
  "esri/views/SceneView",
  "esri/layers/SceneLayer",
  "esri/renderers/SimpleRenderer",
  "esri/renderers/UniqueValueRenderer",
  "esri/widgets/LayerList",
  "esri/widgets/Home",
  "esri/widgets/Legend",
  "esri/widgets/Search",

  "dojo/domReady!"
], function (Map, FeatureLayer, SceneView, SceneLayer, SimpleRenderer, UniqueValueRenderer,
  LayerList, Home, Legend, Search) {


    //////////////////Map and View////////////////////

    var map = new Map({
      basemap: "dark-gray-vector",
      ground: null,
    });

    var view = new SceneView({
      container: "viewDiv",
      map: map,
      center: [106.818050, -6.402058],
      camera: {
        position: [106.818050, -6.402058, 20000],
        tilt: 50,
        heading: 0
      },
      environment: {
        lighting: {
          ambientOcclusionEnabled: true,
          directShadowsEnabled: true
        }
      },
      highlightOptions: {
        color: [0, 255, 255],
        fillOpacity: 0.6
      }
    });

    popup = view.popup;

    //////////////////End of Map and View////////////////////

    ////////////////// Widgets ///////////////////////

    var legend = new Legend({
      view: view,
    });

    view.ui.add(legend, "top-right");

    // var layerList = new LayerList({
    //   view: view
    // });

    // view.ui.add(layerList, {
    //   position: "bottom-left"
    // });

    var searchSource = [{
      featureLayer: new FeatureLayer({
        url: "https://services8.arcgis.com/TWq7UjmDRPE14lEV/arcgis/rest/services/Startup_Jakarta/FeatureServer/0",
        outFields: ["*"]
      }),
      searchFields: ["Company_Name"],
      displayField: "Company_Name",
      exactMatch: false,
      outFields: ["*"],
      name: "Start-Up Name",
      placeholder: "example: Go-Jek",
      maxResults: 6,
      maxSuggestions: 6,
      suggestionsEnabled: true,
      minSuggestCharacters: 0
    }];

    var search = new Search({
      view: view,
      sources: searchSource
    });

    view.ui.add(search, {
      position: "top-left",
      index: 0
    });


    var homeWidget = new Home({
      view: view
    });

    view.ui.add(homeWidget, "top-left");


    //////////////////////End of Widgets//////////////////////


    /////////////////////Layer and PopUp Template///////////////////

    var sumTemplate = {
      title: "Start-Up Count",
      content: "<h1>{Point_Count} Start-Up(s) in this area</h1>"
    };

    var startTemplate = {
      title: "{Company_Name}",
      content: "<b>{Company_Name}</b> is founded on {Founded_Date}. Located at {Address}.<br>" +
                "<a href='https://google.com/search?q={Company_Name}' target='blank_'>Search on Google</a>"
    };

    var summary = new FeatureLayer({
      url: "https://services8.arcgis.com/TWq7UjmDRPE14lEV/ArcGIS/rest/services/Summary_Address/FeatureServer/0",
      title: "Start-Up Jakarta Summary",
      popupTemplate: sumTemplate
    });

    map.add(summary);


    /////////////////////End of Layer and PopUp Template///////////////////



    ////////////////////Symbol and Renderer////////////////////////////////

    var rendererSym = {
      type: "simple",
      symbol: {
        type: "polygon-3d",
        symbolLayers: [{ type: "extrude" }]
      },
      label: "Count of Start-Up",
      visualVariables: [{
        type: "size",
        field: "Point_Count",
        stops: [
          {
            value: 1,
            size: 100
          },
          {
            value: 5,
            size: 500
          },
          {
            value: 10,
            size: 1000
          },
          {
            value: 15,
            size: 1500
          },
          {
            value: 20,
            size: 2000
          }]
      }, {
        type: "color",
        field: "Point_Count",
        stops: [
          {
            value: 1,
            color: [210, 224, 247, 0.7]
          },
          {
            value: 18,
            color: [1, 45, 117, 0.7]
          }]
      }]
    };

    summary.renderer = rendererSym;

    var startRendererX = {
      type: "simple",
      symbol: {
        type: "point-3d",
        symbolLayers: [{
          type: "icon",
          size: 10,
          resource: { href: "asset/icon.png" },
          material: { color: "green" }
        }]
      }
    };


    var startRendererY = {
      type: "simple",
      symbol: {
        type: "point-3d",
        symbolLayers: [{
          type: "icon",
          size: 10,
          resource: { href: "asset/icon.png" },
          // material: { color: "red" }
        }]
      }
    };



    ////////////////////End of Symbol and Renderer////////////////////////////////


    //////////////////////////Slider and Animation/////////////////////


    var slider = document.getElementById('timeSlider');
    var playButton = document.getElementById("play");
    var stopButton = document.getElementById("stop");

    noUiSlider.create(slider, {
      start: 2017,
      connect: true,
      range: {
        'min': 1992,
        'max': 2017
      },
      pips: {
        mode: 'steps',
        stepped: true,
        density: 10
      },
      animate: true
    });


    var animation = null;

    $('#play').click(function () {
      $('#play').hide();
      $('#stop').show();

      startAnimation();

    });


    $('#stop').click(function () {
      $('#play').show();
      $('#stop').hide();

      stopAnimation();

    });

    setYear(2017);

    function setYear(value) {
      $('#sliderValue').text(value);
      slider.noUiSlider.set(value);
    };


    function startAnimation() {
      animation = animate(parseInt(slider.noUiSlider.get()));
    };


    function stopAnimation() {
      if (!animation) {
        return;
      }

      animation.remove();
      animation = null;

    };

    function animate(startValue) {
      var animating = true;
      var value = startValue;

      var frame = function (timestamp) {
        if (!animating) {
          return;
        }

        value += 1;
        if (value > 2017) {
          value = 1992;
        }

        setYear(value);

        setTimeout(function () {
          requestAnimationFrame(frame);
        }, 1000 / 1);
      };

      frame();

      return {
        remove: function () {
          animating = false;
        }
      };
    }





    var startupX = new FeatureLayer({
      url: "https://services8.arcgis.com/TWq7UjmDRPE14lEV/arcgis/rest/services/Startup_Jakarta/FeatureServer/0",
      title: "Start-Up Founded in Year",
      popupTemplate: startTemplate,
      visible: false,
      screenSizePerspectiveEnabled: true,
      renderer: startRendererX,
    });

    map.add(startupX);

    var startupY = new FeatureLayer({
      url: "https://services8.arcgis.com/TWq7UjmDRPE14lEV/arcgis/rest/services/Startup_Jakarta/FeatureServer/0",
      title: "Start-Up Founded <= Year",
      popupTemplate: startTemplate,
      visible: false,
      screenSizePerspectiveEnabled: true,
      renderer: startRendererY,
    });

    map.add(startupY);

    var yearAnimate;

    slider.noUiSlider.on('update', function () {
      yearAnimate = parseInt(slider.noUiSlider.get());
      
      startupX.definitionExpression = "year_only =" + yearAnimate + "";
      startupY.definitionExpression = "year_only <=" + yearAnimate + "";
    });

    $(".location").change(function () {
      if ($(this).prop('checked')) {
        summary.visible = false;
        startupY.visible = true;
        startupX.visible = true;
        $('.timeWrapper').show();
      } else {
        summary.visible = true;
        startupY.visible = false;
        startupX.visible = false;
        $('.timeWrapper').hide();
        $('#play').show();
        $('#stop').hide();
        stopAnimation();
      }
    });




  });
