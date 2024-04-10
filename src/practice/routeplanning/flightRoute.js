//定义一个叫Track的类
class FlightRoute {
    constructor(viewer, options) {
        this._points = options.shoots;
        this._model = undefined;
        this._viewer = viewer;
        this._start = options.start || Cesium.JulianDate.fromDate(new Date());
        this._end = undefined;
        this._pauseTime = options.pauseTime || 0;
        this._speed = options.speed || 0;
        this._modelUri = options.modelUri;
        this._datasource = new Cesium.CustomDataSource("FlightRoute");

        this.drawRoute();
    }

    initModel(position, options) {
        if (!options) {
            return;
        }
        this._model = this._viewer.entities.add({
            position: position,
            model: {
                uri: options.uri,
                minimumPixelSize: options.minimumPixelSize || 64,
                maxnumPixelSize: options.maxnumPixelSize || 128,
                maximumScale: options.maximumScale || 200,
                silhouetteColor: options.silhouetteColor || Cesium.Color.WHITE,
                silhouetteOpacity: options.silhouetteOpacity || 0.5,
                show: options.show || true,
                runAnimations: false,
                scale: 0.05
            },
            path: {
                resolution: 1,
                material: new Cesium.PolylineGlowMaterialProperty({
                    glowPower: 0.1,
                    color: Cesium.Color.RED
                }),
                width: 10,
                show: false
            }
        });
    }

    drawRoute() {
        if (!this._points.length) return;
        let datasource = this._datasource;

        this._points.forEach(p => {
            datasource.entities.add({
                position: new Cesium.Cartesian3.fromDegrees(
                    p.aircraftLongitude,
                    p.aircraftLatitude,
                    p.aircraftAltitude
                ),
                point: {
                    pixelSize: 8,
                    color: Cesium.Color.RED
                },
            });
        })
        const flatPositions = this._points
            .map(p => {
                return [p.aircraftLongitude,p.aircraftLatitude,p.aircraftAltitude]
            }
        ).flat();
        console.log(flatPositions);
        this._datasource.entities.add({
            polyline: {
                positions: new Cesium.Cartesian3.fromDegreesArrayHeights(flatPositions),
                width: 2,
                material: Cesium.Color.YELLOW
            }
        });
        this._viewer.dataSources.add(this._datasource);

        this._viewer.trackedEntity = undefined;
        //眼睛在航迹正上方35高度处
        this._viewer.flyTo(
            datasource, {
            offset: {
                heading: 0,
                pitch: Cesium.Math.toRadians(-90),
                range: 35
            }
        }
        );
    }

    calFlightRoute() {
        if (!this._points || this._points.length < 2) return;
        let results = [];
        let result = { curPoint: null, lastPoint: null, start: null, end: null, distance: 0 };

        let lastPoint = this._points[0];
        let lastStart = this._start;    //初始化第一个航点的开始时间
        for (let i = 0; i < this._points.length; i++) {
            if (i == 0) continue;
            result.curPoint = this._points[i];
            result.lastPoint = lastPoint;
            let startPosition = Cesium.Cartesian3
                .fromDegrees(lastPoint.aircraftLongitude,
                    lastPoint.aircraftLatitude,
                    lastPoint.aircraftAltitude
                );
            let endPosition = Cesium.Cartesian3
                .fromDegrees(
                    this._points[i].aircraftLongitude,
                    this._points[i].aircraftLatitude,
                    this._points[i].aircraftAltitude
                );
            result.distance = Cesium.Cartesian3.distance(startPosition, endPosition);
            result.start = lastStart;
            //两点之间的飞行时间
            let time = result.distance / this._speed;
            //当前点航行的结束时间
            result.end = Cesium.JulianDate.addSeconds(lastStart, time + this._pauseTime, new Cesium.JulianDate());

            results.push(result);

            lastStart = result.end;
            lastPoint = this._points[i];
        }

        return results;
    }

    startFlight() {
        const samplePositionProperty = new Cesium.SampledPositionProperty();
        const routeSegments = this.calFlightRoute();
        routeSegments.forEach((segment) => {
            samplePositionProperty.addSample(segment.start,
                Cesium.Cartesian3.fromDegrees(segment.curPoint.aircraftLongitude,
                    segment.curPoint.aircraftLatitude,
                    segment.curPoint.aircraftAltitude
                )
            );
            samplePositionProperty.addSample(segment.end,
                Cesium.Cartesian3.fromDegrees(segment.curPoint.aircraftLongitude,
                    segment.curPoint.aircraftLatitude,
                    segment.curPoint.aircraftAltitude
                )
            );
        })
        this._viewer.trackedEntity = this._model;
        this.initModel(samplePositionProperty, {
            uri: this._modelUri,
        })
    }
}

