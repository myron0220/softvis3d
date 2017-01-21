///
/// softvis3d-frontend
/// Copyright (C) 2016 Stefan Rinderle and Yvo Niedrich
/// stefan@rinderle.info / yvo.niedrich@gmail.com
///
/// This program is free software; you can redistribute it and/or
/// modify it under the terms of the GNU Lesser General Public
/// License as published by the Free Software Foundation; either
/// version 3 of the License, or (at your option) any later version.
///
/// This program is distributed in the hope that it will be useful,
/// but WITHOUT ANY WARRANTY; without even the implied warranty of
/// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
/// Lesser General Public License for more details.
///
/// You should have received a copy of the GNU Lesser General Public
/// License along with this program; if not, write to the Free Software
/// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02
///
/* tslint:disable */
import {BackendService} from "./BackendService";
import {AppStatusStore} from "../../stores/AppStatusStore";
import {CityBuilderStore} from "../../stores/CityBuilderStore";
import Metric from "../../constants/Metric";

export interface SonarQubeApiMetric {
    id: number;
    key: string;
    type: MetricType;
    name: string;
    hidden?: boolean;
}

export default class SonarQubeMetricsService extends BackendService {
    public static LOAD_METRICS = 'SONAR_LOAD_METRICS';

    private appStatusStore: AppStatusStore;
    private cityBuilderStore: CityBuilderStore;

    constructor(apiUrl: string, appStatusStore: AppStatusStore, cityBuilderStore: CityBuilderStore) {
        super(apiUrl);

        this.appStatusStore = appStatusStore;
        this.cityBuilderStore = cityBuilderStore;
    }

    public loadAvailableMetrics(page = 1) {
        if (page === 1) {
            this.appStatusStore.load(SonarQubeMetricsService.LOAD_METRICS);
        }

        const params = {f: 'name', p: page};
        this.callApi("/metrics/search", { params }).then(response => {
            this.cityBuilderStore.addGenericMetrics(
                (response.data.metrics as Array<SonarQubeApiMetric>)
                    .filter((c) => SonarQubeMetricsService.shouldMetricBeFiltered(c.type))
                    .filter((c) => c.hidden === true || c.hidden === undefined || c.hidden === null)
                    .map((c) => { return this.createMetric(c); })
            );

            const metricsCount = response.data.p * response.data.ps;
            if (metricsCount < response.data.total) {
                this.loadAvailableMetrics(page + 1);
            } else {
                this.appStatusStore.loadComplete(SonarQubeMetricsService.LOAD_METRICS);
            }

        }).catch(error => {
            this.appStatusStore.error("SonarQube metric API is not available or responding: "
                + error.response.statusText);
            this.appStatusStore.loadComplete(SonarQubeMetricsService.LOAD_METRICS);
        });
    }

    private createMetric(sonarQubeMetric: SonarQubeApiMetric): Metric {
        return new Metric(sonarQubeMetric.key, sonarQubeMetric.type, sonarQubeMetric.name);
    }

    private static shouldMetricBeFiltered(type: string): boolean {
        return type === "INT" || type === "FLOAT" || type === "PERCENT"
            || type === "MILLISEC" || type === "RATING" || type === "WORK_DUR";
    }

}