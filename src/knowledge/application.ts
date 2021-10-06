
import Map = require("esri/WebMap");

import CSVLayer = require("esri/layers/CSVLayer");

import Graphic = require("esri/Graphic");
import Viewpoint = require("esri/Viewpoint");
import Circle = require("esri/geometry/Circle");

import SimpleRenderer = require("esri/renderers/SimpleRenderer");
import SimpleMarkerSymbol = require("esri/symbols/SimpleMarkerSymbol");

import MapView = require("esri/views/MapView");

import esriConfig = require("esri/config");
import Portal = require("esri/portal/Portal");

import Home = require("esri/widgets/Home");
import Expand = require("esri/widgets/Expand");
import Zoom = require("esri/widgets/Zoom");
import Legend = require("esri/widgets/Legend");
import FullScreen = require("esri/widgets/Fullscreen");
import { throttle } from "@dojo/core/util";

import Header from "../widgets/Header";
import DropTarget from "../widgets/DropTarget";
import IconButton from "../widgets/IconButton";
import ToggleIconButton from "../widgets/ToggleIconButton";
import HurricaneInfo from "../widgets/HurricaneInfo";

let map: Map;
let view: MapView;
let layer: CSVLayer;
let header: Header;

const mobile = !!navigator.userAgent.match(/Android|iPhone|iPad|iPod/i);

(async () => {

  esriConfig.portalUrl = "https://defense.esri.com/portal";

  const portal = new Portal();

  portal.authMode = "auto ";

  portal.load().then(() => {
    
    const map = new Map({
      portalItem: {
        id: "2cc7d01c4a224b95b9ca030b0b6791fe"
      }
    });

    const view = new MapView({
      container: "viewDiv",
      map: map,
      highlightOptions: {
        fillOpacity: 0,
        color: "#ffffff"
      }
    });

    view.ui.empty("top-left");

    header = new Header({
      title: "Knowledge Test Client",
      actionContent: [
        mobile ?
          new IconButton({
            iconClass: "esri-icon-plus-circled",
            action: addCSVLayer
          }) :
          new IconButton({
            iconClass: "esri-icon-download",
            title: "Download vehicles.csv",
            action: () => {
              window.open("data/vehicles.csv")
            }
          }),
      ]
    });
    const zoom = new Zoom({
      view,
      layout: "horizontal"
    });
    const home = new Home({
      view
    });
    const legend = new Legend({
      view
    });
  
    const target = new DropTarget<CSVLayer>({
      view,
      drop: (dataTransfer: DataTransfer) => {
        const files = dataTransfer.files;
        const file = files[0];
        var template = {
          title: "Vehicle Info",
          content: "Brand: {Brand}, Color: {Color}, Date Reported: {Date}"
        };
        layer = new CSVLayer({
          url: URL.createObjectURL(file),
          popupTemplate: template,
          // "PROJCS[\"South Pole Stereographic_1\",GEOGCS[\"GCS WGS 1984\",DATUM[\"D_WGS_1984\",SPHEROID[\"WGS_1984\",6378137.0,298.257223563]],PRIMEM[\"Greenwich\",0.0],UNIT[\"Degree\",0.0174532925199433]],PROJECTION[\"Stereographic\"],PARAMETER[\"False_Easting\",0.0],PARAMETER[\"False_Northing\",0.0],PARAMETER[\"Central_Meridian\",-145.0],PARAMETER[\"Scale_Factor\",1.0],PARAMETER[\"Latitude_Of_Origin\",-90.0],UNIT[\"Meter\",1.0]]"
          spatialReference: view.spatialReference,
          renderer: new SimpleRenderer({
            symbol: new SimpleMarkerSymbol({
              size: 12,
              color: [255, 84, 54],
              outline: {
                color: [ 255, 255, 255 ],
                width: 2
              }
            })
          })
        });
  
        return layer.load();
      }
    });
  
    view.ui.add(target);
    view.ui.add(header);
    view.ui.add(zoom, "bottom-left");
    view.ui.add(home, "bottom-left");
    view.when();
  
    target.on("drop", (event) => {
      map.removeAll();
      map.add(event.item);
      (header.actionContent[1] as ToggleIconButton).enabled = true;
    });

  });

})();

let drawHandle: IHandle;
let promise: IPromise;
let highlight: IHandle;
let info: HurricaneInfo;

function toggleHighlighting() {
  if (drawHandle) {
    drawHandle.remove();
    drawHandle = null;
    promise && promise.cancel();
    promise = null;
    highlight && highlight.remove();
    view.graphics.removeAll();
    view.ui.remove(info);
    info = null;
    return;
  }

  if (!layer) {
    return;
  }

  info = new HurricaneInfo();
  view.ui.add(info);

  view.whenLayerView(layer)
    .then((layerView: __esri.CSVLayerView) => {

      var performStatistics = throttle((searchArea) => {
        promise && promise.cancel();
        promise = layer
          .queryFeatures({
            geometry: searchArea,
            outStatistics: [
              {
                onStatisticField: "wmo_wind",
                outStatisticFieldName: "max_wmo_wind",
                statisticType: "max"
              }
            ]
          })
          .then(statistics => {
            const maxWind = statistics.features[0].attributes.max_wmo_wind;

            return layer.queryFeatures({
              geometry: searchArea,
              where: `wmo_wind = ${maxWind}`,
              outFields: ["Serial_Num", "Name"]
            })
              .then(maxWindFS => {
                if (!maxWindFS.features[0]) {
                  return null;
                }

                return {
                  maxWind,
                  hurricane: maxWindFS.features[0]
                };
              })
          })
          .then(result => {
            if (!result) {
              info.hurricane = null;
              return [];
            }

            const attr = result.hurricane.attributes;

            info.hurricane = {
              name: attr.Name,
              season: attr.Season,
              maxWind: result.maxWind,
            };

            return layer.queryObjectIds({
              where: `Serial_Num = '${attr.Serial_Num}'`
            });
          })
          .then((objectIds) => {
            highlight && highlight.remove();
            highlight = null;

            if (objectIds.length) {
              highlight = layerView.highlight(objectIds);
            }
          })
          .catch(error => {
            if (error.dojoType) {
              return;
            }
            console.error(error);
          });
      }, 75);

      drawHandle = view.on("drag", (event) => {
        event.stopPropagation();

        view.graphics.removeAll();

        const searchArea = new Circle({
          center: view.toMap(event),
          radius: 500000
        })

        view.graphics.add(new Graphic({
          geometry: searchArea,
          symbol: {
            type: "simple-fill",
            style: "none",
            outline: {
              color: "dark-gray",
              width: 4
            }
          }
        }));

        performStatistics(searchArea);
      });
    });
}

// For mobile support
function addCSVLayer() {
  layer = new CSVLayer({
    url: "src/knowledge/Hurricanes.csv",
    // "PROJCS[\"South Pole Stereographic_1\",GEOGCS[\"GCS WGS 1984\",DATUM[\"D_WGS_1984\",SPHEROID[\"WGS_1984\",6378137.0,298.257223563]],PRIMEM[\"Greenwich\",0.0],UNIT[\"Degree\",0.0174532925199433]],PROJECTION[\"Stereographic\"],PARAMETER[\"False_Easting\",0.0],PARAMETER[\"False_Northing\",0.0],PARAMETER[\"Central_Meridian\",-145.0],PARAMETER[\"Scale_Factor\",1.0],PARAMETER[\"Latitude_Of_Origin\",-90.0],UNIT[\"Meter\",1.0]]"
    spatialReference: view.spatialReference,
    renderer: new SimpleRenderer({
      symbol: new SimpleMarkerSymbol({
        size: 12,
        color: [255, 84, 54],
        outline: {
          color: [ 255, 255, 255 ],
          width: 2
        }
      })
    })
  });

  map.add(layer);
  (header.actionContent[0] as IconButton).enabled = false;
  (header.actionContent[1] as ToggleIconButton).enabled = true;
}
