//定义一个叫Track的类
class FlightRoute {
    constructor(viewer, options) {
        this._takenLocations = options.takenLocations;
        this._model = undefined;
        this._viewer = viewer;
        this._startTime = options.start || Cesium.JulianDate.fromDate(new Date());
        this._endTime = undefined;
        this._pauseTime = options.pauseTime || 0;
        this._speed = options.speed || 0;
        this._modelUri = options.modelUri;
        this._datasource = new Cesium.CustomDataSource("FlightRoute");

        this.drawRoute();
    }

    initModel(position) {
        console.log("initModel", position,this._startTime,this._endTime);
        let self = this;
        this._model = this._viewer.entities.add({
            availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                start: self._startTime,
                stop: self._endTime
            })]),
            position: position,
            model: {
                uri: self._modelUri,
                minimumPixelSize: 64,
                maximumSize: 128,
                maximumScale:  200,
                silhouetteColor: Cesium.Color.WHITE,
                // 模型颜色  ，这里可以设置颜色的变化
                // color: color,
                // 仅用于调试，显示魔仙绘制时的线框
                debugWireframe: false,
                // 仅用于调试。显示模型绘制时的边界球。
                debugShowBoundingVolume: false,
                show: true,
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
        if (!this._takenLocations.length) return;
        let datasource = this._datasource;

        this._takenLocations.forEach(p => {
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
        const flatPositions = this._takenLocations
            .map(p => {
                return [p.aircraftLongitude,p.aircraftLatitude,p.aircraftAltitude]
            }
        ).flat();
        console.log(flatPositions);
        let polylineEnity = this._viewer.entities.add({
            polyline: {
                positions: new Cesium.Cartesian3.fromDegreesArrayHeights(flatPositions),
                width: 2,
                material: Cesium.Color.YELLOW
            }
        });
        this._datasource.entities.add(polylineEnity);
        this._viewer.dataSources.add(this._datasource);

        this._viewer.trackedEntity = undefined;
        //眼睛在航迹正上方85高度处
        this._viewer.flyTo(
            datasource, {
            offset: {
                heading: 0,
                pitch: Cesium.Math.toRadians(-90),
                range: 85
            }
        }
        );

        // this._viewer.camera.flyTo({
        //     destination: Cesium.Cartesian3.fromDegrees(
        //         this._takenLocations[0].aircraftLongitude,
        //         this._takenLocations[0].aircraftLatitude,
        //         this._takenLocations[0].aircraftAltitude
        //     ),
        //     orientation: {
        //         heading: Cesium.Math.toRadians(-90),
        //         pitch: Cesium.Math.toRadians(-15),
        //         range: 50
        //     }
        // });
    }

    calFlightRoute() {
        if (!this._takenLocations || this._takenLocations.length < 2) return;
        let results = [];

        let lastTaken = this._takenLocations[0];
        let lastDepartTime = this._startTime;    //初始化第一个航点的起飞时间
        this._endTime = this._startTime;
        for (let i = 0; i < this._takenLocations.length; i++) {
            if (i == 0) continue;
            let result = { currentTaken: null, lastTaken: null, startTime: null,arrivedTime:null, endTime: null, distance: 0 };
            result.currentTaken = this._takenLocations[i];
            result.lastTaken = lastTaken;
            let lastPos = Cesium.Cartesian3
                .fromDegrees(lastTaken.aircraftLongitude,
                    lastTaken.aircraftLatitude,
                    lastTaken.aircraftAltitude
                );
            let curPos = Cesium.Cartesian3
                .fromDegrees(
                    this._takenLocations[i].aircraftLongitude,
                    this._takenLocations[i].aircraftLatitude,
                    this._takenLocations[i].aircraftAltitude
                );
            result.distance = Cesium.Cartesian3.distance(lastPos, curPos);
            result.startTime = lastDepartTime;
            //两点之间的飞行时间
            let flightDuration = result.distance / this._speed;
            //抵达时间
            result.arrivedTime = Cesium.JulianDate.addSeconds(lastDepartTime, flightDuration, new Cesium.JulianDate());
            //当前点航行的结束时间
            result.endTime = Cesium.JulianDate.addSeconds(lastDepartTime, flightDuration + this._pauseTime, new Cesium.JulianDate());

            results.push(result);
            console.log("result:",result);

            lastDepartTime = result.endTime;
            lastTaken = this._takenLocations[i];
            this._endTime = result.endTime;
        }

        console.log("results.length=", results.length);
        return results;
    }

    startFlight() {
        const samplePositionProperty = new Cesium.SampledPositionProperty();
        const routeSegments = this.calFlightRoute();
        routeSegments.forEach((segment) => {
            samplePositionProperty.addSample(segment.startTime,
                Cesium.Cartesian3.fromDegrees(segment.lastTaken.aircraftLongitude,
                    segment.lastTaken.aircraftLatitude,
                    segment.lastTaken.aircraftAltitude
                )
            );
            samplePositionProperty.addSample(segment.arrivedTime,
                Cesium.Cartesian3.fromDegrees(segment.currentTaken.aircraftLongitude,
                    segment.currentTaken.aircraftLatitude,
                    segment.currentTaken.aircraftAltitude
                )
            );
            samplePositionProperty.addSample(segment.endTime,
                Cesium.Cartesian3.fromDegrees(segment.currentTaken.aircraftLongitude,
                    segment.currentTaken.aircraftLatitude,
                    segment.currentTaken.aircraftAltitude
                )
            );
        })


        this._viewer.clock.startTime = this._startTime.clone();
        this._viewer.clock.stopTime = this._endTime.clone();
        this._viewer.clock.currentTime = this._startTime.clone();
        this._viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
        this._viewer.clock.multiplier = 1;
        this._viewer.clock.shouldAnimate = true;
    
        this.initModel(samplePositionProperty);

    }
}

