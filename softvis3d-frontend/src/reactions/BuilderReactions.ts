///
/// softvis3d-frontend
/// Copyright (C) 2020 Stefan Rinderle and Yvo Niedrich
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

import { reaction } from "mobx";
import { lazyInject } from "../inversify.config";
import AutoReloadService from "../services/AutoReloadService";
import SonarQubeMeasuresService from "../services/sonarqube/measures/SonarQubeMeasuresService";
import CityBuilderStore from "../stores/CityBuilderStore";
import SceneStore from "../stores/SceneStore";

export default class BuilderReactions {
    private readonly cityBuilderStore: CityBuilderStore;
    private readonly sceneStore: SceneStore;

    @lazyInject("SonarQubeMeasuresService")
    private readonly measuresService!: SonarQubeMeasuresService;
    @lazyInject("AutoReloadService")
    private readonly autoReloadService!: AutoReloadService;

    constructor(cityBuilderStore: CityBuilderStore, sceneStore: SceneStore) {
        this.cityBuilderStore = cityBuilderStore;
        this.sceneStore = sceneStore;
        this.prepareReactions();
    }

    private prepareReactions() {
        reaction(
            () => this.cityBuilderStore.initiateBuildProcess,
            () => {
                if (this.cityBuilderStore.initiateBuildProcess) {
                    this.cityBuilderStore.initiateBuildProcess = false;

                    this.measuresService.loadMeasures(this.cityBuilderStore, this.sceneStore);
                    this.autoReloadService.startAutoReload();
                }
            },
            {
                name: "Transfer all required data to the scene",
            }
        );
    }
}
