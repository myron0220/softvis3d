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

import { injectable } from "inversify";
import { MeshLambertMaterial, Scene } from "three";
import { lazyInject } from "../../../../inversify.config";
import SceneStore from "../../../../stores/SceneStore";
import { SoftVis3dMesh } from "../../domain/SoftVis3dMesh";
import { SoftVis3dShape } from "../../domain/SoftVis3dShape";
import { ObjectFactory } from "./ObjectFactory";
import * as THREE from 'three';

/**
 * @class This is a resource manager and loads individual models.
 *
 * @struct
 * @constructor
 */
@injectable()
export class Wrangler {
    private objectsInView: SoftVis3dMesh[] = [];

    @lazyInject("SceneStore")
    private readonly sceneStore!: SceneStore;

    public loadSoftVis3d(scene: Scene, data: SoftVis3dShape[]) {
        this.removeAllFromScene(scene);

        this.objectsInView = ObjectFactory.getSceneObjects(data);

        for (const object of this.objectsInView) {
            scene.add(object);
        }

        // <--------- Myron TEST 1 meshline 2022 Sep 20 --------->        
        // // create line
        // const points = [];
        // points.push( new THREE.Vector3( -600, 200, 0 ) ); // (x, z, y)
        // points.push( new THREE.Vector3( 0, 400, 0 ) ); // (x, z, y)
        // points.push( new THREE.Vector3( 600, 200, 0 ) ); // (x, z, y)
        // const line = new MeshLine();
        // line.setPoints(points);
        
        // // create material
        // const material = new MeshLineMaterial({
        //   color: 0x98BF64,
        //   lineWidth: 5,
        // });

        // // create a mesh and add it to the scene
        // const mesh = new THREE.Mesh(line, material);
        // scene.add(mesh);

        // <--------- Myron TEST 2 CubicBezierCurve3 2022 Sep 20 --------->  
        // create geometry
        const curve = new THREE.CubicBezierCurve3(
          new THREE.Vector3(-600, 200, 0),
          new THREE.Vector3(-300, 400, 0),
          new THREE.Vector3(300, 400, 0),
          new THREE.Vector3(600, 200, 0)
        );
        const points = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        
        // create material
        const material = new THREE.LineBasicMaterial( { 
          color: 0x98BF64,
        } );
        
        // create object
        const curveObject = new THREE.Line( geometry, material );
        scene.add(curveObject);
    }

    public updateColorsWithUpdatedShapes(shapes: SoftVis3dShape[]) {
        const resultObjects: SoftVis3dMesh[] = ObjectFactory.getSceneObjects(shapes);

        // update colors
        for (let index = 0; index < resultObjects.length; index++) {
            this.objectsInView[index].material.color = resultObjects[index].material.color;
        }

        // update selected object
        if (this.sceneStore.selectedTreeObjects.length > 0) {
            const formerSelectedObjectId: string =
                this.sceneStore.selectedTreeObjects[0].object.getSoftVis3dId();
            this.sceneStore.selectedTreeObjects = [];
            this.selectSceneTreeObject(formerSelectedObjectId);
        }
    }

    public selectSceneTreeObject(objectSoftVis3dId: string | null) {
        // reset former selected objects

        for (const previousSelection of this.sceneStore.selectedTreeObjects) {
            previousSelection.object.material.color.setHex(previousSelection.color);
        }

        this.sceneStore.selectedTreeObjects = [];

        if (objectSoftVis3dId !== null) {
            for (const obj of this.objectsInView) {
                if (objectSoftVis3dId === obj.getSoftVis3dId()) {
                    const selectedObjectMaterial: MeshLambertMaterial = obj.material;

                    const selectedObjectInformation = {
                        object: obj,
                        color: selectedObjectMaterial.color.getHex(),
                    };

                    this.sceneStore.selectedTreeObjects.push(selectedObjectInformation);

                    selectedObjectMaterial.color.setHex(0xffc519);
                }
            }
        }
    }

    public getObjectsInView(): SoftVis3dMesh[] {
        return this.objectsInView;
    }

    public destroy(scene: Scene) {
        this.removeAllFromScene(scene);

        this.objectsInView = [];
        this.sceneStore.selectedTreeObjects = [];
    }

    private removeAllFromScene(scene: Scene) {
        while (this.objectsInView.length) {
            scene.remove(this.objectsInView.pop() as SoftVis3dMesh);
        }
    }
}
