var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "esri/WebMap", "esri/layers/CSVLayer", "esri/Graphic", "esri/geometry/Circle", "esri/renderers/SimpleRenderer", "esri/symbols/SimpleMarkerSymbol", "esri/views/MapView", "esri/config", "esri/portal/Portal", "esri/widgets/Home", "esri/widgets/Zoom", "esri/widgets/Legend", "@dojo/core/util", "../widgets/Header", "../widgets/DropTarget", "../widgets/IconButton", "../widgets/HurricaneInfo"], function (require, exports, Map, CSVLayer, Graphic, Circle, SimpleRenderer, SimpleMarkerSymbol, MapView, esriConfig, Portal, Home, Zoom, Legend, util_1, Header_1, DropTarget_1, IconButton_1, HurricaneInfo_1) {
    "use strict";
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    var map;
    var view;
    var layer;
    var header;
    var mobile = !!navigator.userAgent.match(/Android|iPhone|iPad|iPod/i);
    (function () { return __awaiter(_this, void 0, void 0, function () {
        var portal;
        return __generator(this, function (_a) {
            esriConfig.portalUrl = "https://defense.esri.com/portal";
            portal = new Portal();
            portal.authMode = "auto ";
            portal.load().then(function () {
                var map = new Map({
                    portalItem: {
                        id: "2cc7d01c4a224b95b9ca030b0b6791fe"
                    }
                });
                var view = new MapView({
                    container: "viewDiv",
                    map: map,
                    highlightOptions: {
                        fillOpacity: 0,
                        color: "#ffffff"
                    }
                });
                view.ui.empty("top-left");
                header = new Header_1.default({
                    title: "Knowledge Test Client",
                    actionContent: [
                        mobile ?
                            new IconButton_1.default({
                                iconClass: "esri-icon-plus-circled",
                                action: addCSVLayer
                            }) :
                            new IconButton_1.default({
                                iconClass: "esri-icon-download",
                                title: "Download vehicles.csv",
                                action: function () {
                                    window.open("data/vehicles.csv");
                                }
                            }),
                    ]
                });
                var zoom = new Zoom({
                    view: view,
                    layout: "horizontal"
                });
                var home = new Home({
                    view: view
                });
                var legend = new Legend({
                    view: view
                });
                var target = new DropTarget_1.default({
                    view: view,
                    drop: function (dataTransfer) {
                        var files = dataTransfer.files;
                        var file = files[0];
                        /*         const template = {
                                  title: "Vehicle Info",
                                  content: "Brand: {Brand}, Color: {Color}, Date Reported: {Date}"
                                }; */
                        console.log(URL.createObjectURL(file));
                        layer = new CSVLayer({
                            title: file.name,
                            url: URL.createObjectURL(file),
                            //popupTemplate: template,
                            // "PROJCS[\"South Pole Stereographic_1\",GEOGCS[\"GCS WGS 1984\",DATUM[\"D_WGS_1984\",SPHEROID[\"WGS_1984\",6378137.0,298.257223563]],PRIMEM[\"Greenwich\",0.0],UNIT[\"Degree\",0.0174532925199433]],PROJECTION[\"Stereographic\"],PARAMETER[\"False_Easting\",0.0],PARAMETER[\"False_Northing\",0.0],PARAMETER[\"Central_Meridian\",-145.0],PARAMETER[\"Scale_Factor\",1.0],PARAMETER[\"Latitude_Of_Origin\",-90.0],UNIT[\"Meter\",1.0]]"
                            spatialReference: view.spatialReference,
                            outFields: ["*"],
                            renderer: new SimpleRenderer({
                                symbol: new SimpleMarkerSymbol({
                                    size: 12,
                                    color: [255, 84, 54],
                                    outline: {
                                        color: [255, 255, 255],
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
                target.on("drop", function (event) {
                    map.removeAll();
                    map.add(event.item);
                    view.goTo(event.item.fullExtent);
                    var template = {
                        title: event.item.title,
                        content: [
                            {
                                type: "fields",
                                fieldInfos: [],
                                visible: true
                            }
                        ]
                    };
                    for (var i = 0; layer.fields.length > i; i++) {
                        template.content[0].fieldInfos.push({
                            fieldName: layer.fields[i].name,
                            label: layer.fields[i].name
                        });
                    }
                    layer.popupTemplate = template;
                    header.actionContent[1].enabled = true;
                });
            });
            return [2 /*return*/];
        });
    }); })();
    var drawHandle;
    var promise;
    var highlight;
    var info;
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
        info = new HurricaneInfo_1.default();
        view.ui.add(info);
        view.whenLayerView(layer)
            .then(function (layerView) {
            var performStatistics = util_1.throttle(function (searchArea) {
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
                    .then(function (statistics) {
                    var maxWind = statistics.features[0].attributes.max_wmo_wind;
                    return layer.queryFeatures({
                        geometry: searchArea,
                        where: "wmo_wind = " + maxWind,
                        outFields: ["Serial_Num", "Name"]
                    })
                        .then(function (maxWindFS) {
                        if (!maxWindFS.features[0]) {
                            return null;
                        }
                        return {
                            maxWind: maxWind,
                            hurricane: maxWindFS.features[0]
                        };
                    });
                })
                    .then(function (result) {
                    if (!result) {
                        info.hurricane = null;
                        return [];
                    }
                    var attr = result.hurricane.attributes;
                    info.hurricane = {
                        name: attr.Name,
                        season: attr.Season,
                        maxWind: result.maxWind,
                    };
                    return layer.queryObjectIds({
                        where: "Serial_Num = '" + attr.Serial_Num + "'"
                    });
                })
                    .then(function (objectIds) {
                    highlight && highlight.remove();
                    highlight = null;
                    if (objectIds.length) {
                        highlight = layerView.highlight(objectIds);
                    }
                })
                    .catch(function (error) {
                    if (error.dojoType) {
                        return;
                    }
                    console.error(error);
                });
            }, 75);
            drawHandle = view.on("drag", function (event) {
                event.stopPropagation();
                view.graphics.removeAll();
                var searchArea = new Circle({
                    center: view.toMap(event),
                    radius: 500000
                });
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
                        color: [255, 255, 255],
                        width: 2
                    }
                })
            })
        });
        map.add(layer);
        header.actionContent[0].enabled = false;
        header.actionContent[1].enabled = true;
    }
});
//# sourceMappingURL=application.js.map