/*
    3D Halftone Generator Ver 7.6
    Created by ykwe with Gemini for Adobe Illustrator
    This is a personally developed alpha version.
    We apologize for any bugs or issues that may occur.
    We cannot be held responsible for any problems.
*/

(function() {
    try {
        if (app.documents.length === 0) {
            alert("ドキュメントを開いてから実行してください。");
            return;
        }

        var finalDots = [];
        var finalParams = {};
        var isConfirmed = false; 

        // =========================================================
        // 1. UI構築
        // =========================================================
        var dialog = new Window("dialog", "3Dハーフトーン V7.6");
        dialog.orientation = "column";
        dialog.alignChildren = ["fill", "top"];
        dialog.spacing = 10;
        dialog.margins = 16;

        // --- A. ドット個数 / 出力モード ---
        var pMain = dialog.add("panel", undefined, "ドット個数 / 出力モード");
        pMain.orientation = "column";
        pMain.alignChildren = ["left", "top"];
        pMain.spacing = 8;

        var gCnt = pMain.add("group");
        gCnt.add("statictext", undefined, "X:");
        var inX = gCnt.add("edittext", undefined, "8"); inX.characters = 3;
        gCnt.add("statictext", undefined, "個    Y:");
        var inY = gCnt.add("edittext", undefined, "8"); inY.characters = 3;
        gCnt.add("statictext", undefined, "個    Z:");
        var inZ = gCnt.add("edittext", undefined, "8"); inZ.characters = 3;
        gCnt.add("statictext", undefined, "個");

        var div1 = pMain.add("panel", [0,0,300,1]); 
        div1.alignment = "fill";

        var gOutMode = pMain.add("group");
        gOutMode.orientation = "row";
        gOutMode.add("statictext", undefined, "出力範囲:");
        var rbOutAll = gOutMode.add("radiobutton", undefined, "全て");
        var rbOutSurf = gOutMode.add("radiobutton", undefined, "面のみ");
        var rbOutFrame = gOutMode.add("radiobutton", undefined, "フレームのみ");
        rbOutAll.value = true;

        var gFrameVis = pMain.add("group");
        gFrameVis.orientation = "row";
        gFrameVis.add("statictext", undefined, "フレームの表示:");
        var rbFrameOn = gFrameVis.add("radiobutton", undefined, "オン");
        var rbFrameOff = gFrameVis.add("radiobutton", undefined, "オフ");
        rbFrameOn.value = true;

        var gFaceVis = pMain.add("group");
        gFaceVis.orientation = "row";
        gFaceVis.add("statictext", undefined, "面の表示:");
        var rbTrans = gFaceVis.add("radiobutton", undefined, "透過");
        var rbOpaque = gFaceVis.add("radiobutton", undefined, "不透過");
        rbTrans.value = true;

        function updateOutputUI() {
            if (rbOutFrame.value) {
                gFrameVis.visible = false;
            } else {
                gFrameVis.visible = true;
            }
        }
        rbOutAll.onClick = updateOutputUI;
        rbOutSurf.onClick = updateOutputUI;
        rbOutFrame.onClick = updateOutputUI;
        updateOutputUI(); 


        // --- B. シェイプ設定 ---
        var pShape = dialog.add("panel", undefined, "シェイプ設定");
        pShape.orientation = "column";
        pShape.alignChildren = ["left", "top"];

        var gShapeType = pShape.add("group");
        var rbCircle = gShapeType.add("radiobutton", undefined, "丸");
        var rbRect = gShapeType.add("radiobutton", undefined, "四角");
        var rbText = gShapeType.add("radiobutton", undefined, "テキスト");
        rbCircle.value = true;

        // Stack Group
        var gShapeStack = pShape.add("group");
        gShapeStack.orientation = "stack";
        gShapeStack.alignChildren = ["left", "center"];

        // 1. 丸
        var gCircleInput = gShapeStack.add("group");
        gCircleInput.add("statictext", undefined, "直径:");
        var inDia = gCircleInput.add("edittext", undefined, "10"); inDia.characters = 4;
        gCircleInput.add("statictext", undefined, "pt");

        // 2. 四角
        var gRectInput = gShapeStack.add("group");
        gRectInput.add("statictext", undefined, "幅:");
        var inRectW = gRectInput.add("edittext", undefined, "10"); inRectW.characters = 4;
        gRectInput.add("statictext", undefined, "pt   高さ:");
        var inRectH = gRectInput.add("edittext", undefined, "10"); inRectH.characters = 4;
        gRectInput.add("statictext", undefined, "pt");
        gRectInput.visible = false;

        // 3. テキスト
        var gTextInput = gShapeStack.add("group");
        gTextInput.orientation = "column";
        gTextInput.alignChildren = ["left", "top"];
        gTextInput.visible = false;
        
        var gTextRow1 = gTextInput.add("group");
        gTextRow1.add("statictext", undefined, "サイズ:");
        var inTextSize = gTextRow1.add("edittext", undefined, "10"); inTextSize.characters = 4;
        gTextRow1.add("statictext", undefined, "pt   文字:");
        var inTextStr = gTextRow1.add("edittext", undefined, "ABC"); inTextStr.characters = 8;

        var gTextRow2 = gTextInput.add("group");
        var rbTextSeq = gTextRow2.add("radiobutton", undefined, "リピート");
        var rbTextRnd = gTextRow2.add("radiobutton", undefined, "ランダム");
        rbTextSeq.value = true;

        var gSeqSettings = gTextInput.add("panel", undefined, "開始位置・進行順序");
        gSeqSettings.orientation = "column";
        gSeqSettings.alignChildren = ["left", "top"];
        gSeqSettings.spacing = 5;

        var gSeqStart = gSeqSettings.add("group");
        gSeqStart.add("statictext", undefined, "始点:");
        var listStartX = gSeqStart.add("dropdownlist", undefined, ["左から", "右から"]);
        listStartX.selection = 0; 
        var listStartY = gSeqStart.add("dropdownlist", undefined, ["上から", "下から"]);
        listStartY.selection = 0;
        var listStartZ = gSeqStart.add("dropdownlist", undefined, ["前から", "奥から"]);
        listStartZ.selection = 0;

        var gSeqOrder = gSeqSettings.add("group");
        gSeqOrder.add("statictext", undefined, "埋める順:");
        var listOrder = gSeqOrder.add("dropdownlist", undefined, [
            "X → Y → Z (横 → 下 → 奥)", 
            "X → Z → Y", 
            "Y → X → Z", 
            "Y → Z → X", 
            "Z → X → Y", 
            "Z → Y → X"
        ]);
        listOrder.selection = 0;

        function updateTextUI() {
            if (rbTextSeq.value) {
                gSeqSettings.visible = true;
            } else {
                gSeqSettings.visible = false;
            }
        }
        rbTextSeq.onClick = updateTextUI;
        rbTextRnd.onClick = updateTextUI;
        
        rbCircle.onClick = function() { gCircleInput.visible = true; gRectInput.visible = false; gTextInput.visible = false; }
        rbRect.onClick = function() { gCircleInput.visible = false; gRectInput.visible = true; gTextInput.visible = false; }
        rbText.onClick = function() { gCircleInput.visible = false; gRectInput.visible = false; gTextInput.visible = true; updateTextUI(); }

        var gPitch = pShape.add("group");
        gPitch.add("statictext", undefined, "間隔:");
        var inPitch = gPitch.add("edittext", undefined, "25"); inPitch.characters = 4;
        gPitch.add("statictext", undefined, "pt");


        // --- C. オブジェクト回転 ---
        var pRot = dialog.add("panel", undefined, "オブジェクト回転");
        pRot.orientation = "row";
        pRot.alignChildren = ["left", "center"];
        
        pRot.add("statictext", undefined, "X:");
        var inRotX = pRot.add("edittext", undefined, "12"); inRotX.characters = 3;
        pRot.add("statictext", undefined, "°      Y:");
        var inRotY = pRot.add("edittext", undefined, "22"); inRotY.characters = 3;
        pRot.add("statictext", undefined, "°      Z:");
        var inRotZ = pRot.add("edittext", undefined, "0"); inRotZ.characters = 3;
        pRot.add("statictext", undefined, "°");


        // --- D. カメラ ---
        var pCam = dialog.add("panel", undefined, "カメラ");
        pCam.orientation = "column";
        pCam.alignChildren = ["left", "top"];

        var gCamMode = pCam.add("group");
        var rbAuto = gCamMode.add("radiobutton", undefined, "自動");
        var rbManual = gCamMode.add("radiobutton", undefined, "マニュアル");
        rbAuto.value = true;

        var gCamStack = pCam.add("group");
        gCamStack.orientation = "stack";
        gCamStack.alignChildren = ["left", "center"];

        var gAutoInputs = gCamStack.add("group");
        gAutoInputs.orientation = "column";
        gAutoInputs.alignChildren = ["left", "center"];
        var gD1 = gAutoInputs.add("group");
        gD1.add("statictext", undefined, "カメラ距離:");
        var inAutoDist = gD1.add("edittext", undefined, "600"); inAutoDist.characters = 5;
        gD1.add("statictext", undefined, "pt");
        var gD2 = gAutoInputs.add("group");
        gD2.add("statictext", undefined, "表示倍率:");
        var inAutoZoom = gD2.add("edittext", undefined, "1"); inAutoZoom.characters = 5;
        gD2.add("statictext", undefined, "倍");

        var gManualInputs = gCamStack.add("group");
        gManualInputs.orientation = "column";
        gManualInputs.alignChildren = ["left", "center"];
        gManualInputs.visible = false;
        var gM1 = gManualInputs.add("group");
        gM1.add("statictext", undefined, "カメラ距離:");
        var inManDist = gM1.add("edittext", undefined, "600"); inManDist.characters = 5;
        gM1.add("statictext", undefined, "pt");
        var gM2 = gManualInputs.add("group");
        gM2.add("statictext", undefined, "レンズ焦点距離:");
        var inManFocal = gM2.add("edittext", undefined, "500"); inManFocal.characters = 5;

        rbAuto.onClick = function() { gAutoInputs.visible = true; gManualInputs.visible = false; }
        rbManual.onClick = function() { gAutoInputs.visible = false; gManualInputs.visible = true; }


        // --- E. 効果 ---
        var pEffect = dialog.add("panel", undefined, "効果");
        pEffect.orientation = "column";
        pEffect.alignChildren = ["left", "center"];

        var gEffMode = pEffect.add("group");
        var rbEffNone = gEffMode.add("radiobutton", undefined, "なし");
        var rbEffGrad = gEffMode.add("radiobutton", undefined, "グラデーション");
        var rbEffLight = gEffMode.add("radiobutton", undefined, "ライティング");
        rbEffNone.value = true; 

        var gEffParams = pEffect.add("group");
        gEffParams.orientation = "column";
        gEffParams.alignChildren = ["left", "center"];
        gEffParams.enabled = false;

        var gAng = gEffParams.add("group");
        gAng.orientation = "row";
        var lblAngH = gAng.add("statictext", undefined, "水平角"); 
        var inEffH = gAng.add("edittext", undefined, "0"); inEffH.characters = 4;
        gAng.add("statictext", undefined, "°");
        
        var lblAngV = gAng.add("statictext", undefined, "垂直角");
        var inEffV = gAng.add("edittext", undefined, "0"); inEffV.characters = 4;
        gAng.add("statictext", undefined, "°");

        var gRange = gEffParams.add("group");
        gRange.orientation = "row";
        var lblStart = gRange.add("statictext", undefined, "最大明度:");
        var inStartVal = gRange.add("edittext", undefined, "100"); inStartVal.characters = 3;
        gRange.add("statictext", undefined, "%");
        gRange.add("statictext", undefined, " → ");
        var lblEnd = gRange.add("statictext", undefined, "最小明度:");
        var inEndVal = gRange.add("edittext", undefined, "20"); inEndVal.characters = 3;
        gRange.add("statictext", undefined, "%");

        function updateEffectUI() {
            if (rbEffNone.value) {
                gEffParams.enabled = false;
            } else {
                gEffParams.enabled = true;
                if (rbEffGrad.value) {
                    lblAngH.text = "水平角"; 
                    lblAngV.text = "垂直角";
                    lblStart.text = "開始:";
                    lblEnd.text = "終了:";
                } else {
                    lblAngH.text = "水平角"; 
                    lblAngV.text = "垂直角";
                    lblStart.text = "最大明度:";
                    lblEnd.text = "最小明度:";
                }
            }
        }

        rbEffNone.onClick = updateEffectUI;
        rbEffGrad.onClick = updateEffectUI;
        rbEffLight.onClick = updateEffectUI;
        updateEffectUI(); 


        // --- F. ログ ---
        var gLog = dialog.add("group");
        var cbCreateLog = gLog.add("checkbox", undefined, "設定値をテキストとして出力する");
        cbCreateLog.value = true;


        // ボタン
        var gBtn = dialog.add("group");
        gBtn.alignment = "center";
        var btnCancel = gBtn.add("button", undefined, "キャンセル", {name: "cancel"});
        var btnOk = gBtn.add("button", undefined, "生成する");


        // =========================================================
        // 処理ロジック
        // =========================================================
        
        function getParamsFromUI() {
            var p = {};
            p.countX = parseInt(inX.text) || 5;
            p.countY = parseInt(inY.text) || 5;
            p.countZ = parseInt(inZ.text) || 5;
            
            p.outputMode = 0;
            p.outputModeStr = "全て";
            if (rbOutSurf.value) { p.outputMode = 1; p.outputModeStr = "面のみ"; }
            if (rbOutFrame.value) { p.outputMode = 2; p.outputModeStr = "フレームのみ"; }

            p.showFrame = rbFrameOn.value;
            if (p.outputMode === 2) p.showFrame = true;

            p.isOpaque = rbOpaque.value; 

            p.shapeMode = "circle";
            if (rbRect.value) p.shapeMode = "rect";
            if (rbText.value) p.shapeMode = "text";

            p.baseDia = parseFloat(inDia.text) || 10;
            p.baseW = parseFloat(inRectW.text) || 10;
            p.baseH = parseFloat(inRectH.text) || 10;
            
            p.baseTextSize = parseFloat(inTextSize.text) || 10;
            p.textString = inTextStr.text;
            if (p.textString.length === 0) p.textString = "A";
            p.isTextSeq = rbTextSeq.value;

            // リスト選択
            var selOrderIdx = (listOrder.selection) ? listOrder.selection.index : 0;
            var selOrderText = (listOrder.selection) ? listOrder.selection.text : "X → Y → Z";
            
            var selStartX = (listStartX.selection) ? listStartX.selection.index : 0;
            var selStartY = (listStartY.selection) ? listStartY.selection.index : 0;
            var selStartZ = (listStartZ.selection) ? listStartZ.selection.index : 0;
            
            var selStartXText = (listStartX.selection) ? listStartX.selection.text : "左";
            var selStartYText = (listStartY.selection) ? listStartY.selection.text : "上";
            var selStartZText = (listStartZ.selection) ? listStartZ.selection.text : "前";

            switch(selOrderIdx) {
                case 0: p.sortOrder = ["z", "y", "x"]; break;
                case 1: p.sortOrder = ["y", "z", "x"]; break;
                case 2: p.sortOrder = ["z", "x", "y"]; break;
                case 3: p.sortOrder = ["x", "z", "y"]; break;
                case 4: p.sortOrder = ["y", "x", "z"]; break;
                case 5: p.sortOrder = ["x", "y", "z"]; break;
                default: p.sortOrder = ["z", "y", "x"]; break;
            }
            
            // ログ用ラベル
            var parts = selOrderText.split(" ");
            if (parts.length >= 5) {
                p.orderLabel = parts[0] + parts[2] + parts[4];
            } else {
                p.orderLabel = "XYZ";
            }

            p.dirX = selStartX;
            p.dirY = (selStartY === 0) ? 1 : 0; 
            p.dirZ = selStartZ;
            p.startLabel = selStartXText.charAt(0) + selStartYText.charAt(0) + selStartZText.charAt(0);

            p.pitch = parseFloat(inPitch.text) || 30;

            p.rotX = (parseFloat(inRotX.text) || 0) * (Math.PI / 180);
            p.rotY = (parseFloat(inRotY.text) || 0) * (Math.PI / 180);
            p.rotZ = (parseFloat(inRotZ.text) || 0) * (Math.PI / 180);

            p.camDist = 1000; p.focalLength = 800;
            p.isAutoMode = rbAuto.value;
            if (p.isAutoMode) {
                p.camDist = parseFloat(inAutoDist.text) || 1000;
                var zoomFactor = parseFloat(inAutoZoom.text) || 1;
                p.focalLength = p.camDist * zoomFactor;
                p.camStr = "自動 / 距離: " + p.camDist + " / 倍率: " + inAutoZoom.text;
            } else {
                p.camDist = parseFloat(inManDist.text) || 1000;
                p.focalLength = parseFloat(inManFocal.text) || 800;
                p.camStr = "マニュアル / 距離: " + p.camDist + " / 焦点: " + p.focalLength;
            }

            p.effectMode = "none";
            if (rbEffGrad.value) p.effectMode = "gradient";
            if (rbEffLight.value) p.effectMode = "lighting";

            p.effAngH = parseFloat(inEffH.text) || 0;
            p.effAngV = parseFloat(inEffV.text) || 0;
            p.valStart = (parseFloat(inStartVal.text) || 100) / 100;
            p.valEnd = (parseFloat(inEndVal.text) || 0) / 100;

            p.createLog = cbCreateLog.value;
            p.rotXDeg = inRotX.text; p.rotYDeg = inRotY.text; p.rotZDeg = inRotZ.text;

            return p;
        }

        // 計算ロジック
        function calculateDots(p) {
            var radH = p.effAngH * (Math.PI / 180);
            var radV = p.effAngV * (Math.PI / 180);
            var vecY = -Math.sin(radV); 
            var rPlane = Math.cos(radV);
            var vecX = rPlane * Math.cos(radH);
            var vecZ = rPlane * Math.sin(radH);
            
            var len = Math.sqrt(vecX*vecX + vecY*vecY + vecZ*vecZ);
            if(len > 0) { vecX/=len; vecY/=len; vecZ/=len; }

            var faces = [
                { name: "left",   x: -1, y: 0, z: 0 },
                { name: "right",  x: 1,  y: 0, z: 0 },
                { name: "top",    x: 0,  y: -1, z: 0 },
                { name: "bottom", x: 0,  y: 1,  z: 0 },
                { name: "front",  x: 0,  y: 0,  z: -1 }, 
                { name: "back",   x: 0,  y: 0,  z: 1 }   
            ];

            var rotatedFaces = {}; 
            for (var f = 0; f < faces.length; f++) {
                var nx = faces[f].x;
                var ny = faces[f].y;
                var nz = faces[f].z;

                var ny1 = ny * Math.cos(p.rotX) - nz * Math.sin(p.rotX);
                var nz1 = ny * Math.sin(p.rotX) + nz * Math.cos(p.rotX);
                var nx2 = nx * Math.cos(p.rotY) - nz1 * Math.sin(p.rotY);
                var nz2 = nx * Math.sin(p.rotY) + nz1 * Math.cos(p.rotY);
                var nx3 = nx2 * Math.cos(p.rotZ) - ny1 * Math.sin(p.rotZ);
                var ny3 = nx2 * Math.sin(p.rotZ) + ny1 * Math.cos(p.rotZ);
                
                rotatedFaces[faces[f].name] = { x: nx3, y: ny3, z: nz2 };
            }

            var minProj = Infinity, maxProj = -Infinity, projLength = 1;
            var offX = (p.countX - 1) * p.pitch / 2;
            var offY = (p.countY - 1) * p.pitch / 2;
            var offZ = (p.countZ - 1) * p.pitch / 2;

            if (p.effectMode === "gradient") {
                var cornersX = [-offX, (p.countX-1)*p.pitch - offX];
                var cornersY = [-offY, (p.countY-1)*p.pitch - offY];
                var cornersZ = [-offZ, (p.countZ-1)*p.pitch - offZ];
                for (var ix=0; ix<2; ix++) {
                    for (var iy=0; iy<2; iy++) {
                        for (var iz=0; iz<2; iz++) {
                            var val = cornersX[ix] * vecX + cornersY[iy] * vecY + cornersZ[iz] * vecZ;
                            if (val < minProj) minProj = val;
                            if (val > maxProj) maxProj = val;
                        }
                    }
                }
                projLength = maxProj - minProj;
                if (projLength === 0) projLength = 1;
            }

            var results = [];

            for (var k = 0; k < p.countZ; k++) {
                for (var j = 0; j < p.countY; j++) {
                    for (var i = 0; i < p.countX; i++) {
                        
                        var onLeft   = (i === 0);
                        var onRight  = (i === p.countX - 1);
                        var onTop    = (j === 0);
                        var onBottom = (j === p.countY - 1);
                        var onFront  = (k === 0);
                        var onBack   = (k === p.countZ - 1);

                        var belongingFaces = [];
                        if (onLeft) belongingFaces.push("left");
                        if (onRight) belongingFaces.push("right");
                        if (onTop) belongingFaces.push("top");
                        if (onBottom) belongingFaces.push("bottom");
                        if (onFront) belongingFaces.push("front");
                        if (onBack) belongingFaces.push("back");

                        var faceCount = belongingFaces.length;
                        var isFrame = (faceCount >= 2);
                        var isFace = (faceCount === 1);
                        var isInside = (faceCount === 0);

                        var shouldRender = false;
                        if (p.outputMode === 2) {
                            if (isFrame) shouldRender = true;
                        } else if (p.outputMode === 1) {
                            if (!isInside) {
                                if (isFace) shouldRender = true;
                                if (isFrame && p.showFrame) shouldRender = true;
                            }
                        } else {
                            if (isInside) shouldRender = true;
                            else if (isFace) shouldRender = true;
                            else if (isFrame && p.showFrame) shouldRender = true;
                        }

                        if (!shouldRender) continue; 

                        var x = i * p.pitch - offX;
                        var y = j * p.pitch - offY;
                        var z = k * p.pitch - offZ;

                        var y1_r = y * Math.cos(p.rotX) - z * Math.sin(p.rotX);
                        var z1_r = y * Math.sin(p.rotX) + z * Math.cos(p.rotX);
                        var x2_r = x * Math.cos(p.rotY) - z1_r * Math.sin(p.rotY);
                        var z2_r = x * Math.sin(p.rotY) + z1_r * Math.cos(p.rotY);
                        var x3_r = x2_r * Math.cos(p.rotZ) - y1_r * Math.sin(p.rotZ);
                        var y3_r = x2_r * Math.sin(p.rotZ) + y1_r * Math.cos(p.rotZ);
                        var finalX = x3_r; var finalY = y3_r; var finalZ = z2_r; 

                        var isVisibleFromCamera = true;
                        var visibleFacesForLighting = [];

                        if (p.isOpaque) {
                            if (isInside) {
                                isVisibleFromCamera = false;
                            } else {
                                isVisibleFromCamera = false; 
                                var viewVecX = finalX; var viewVecY = finalY; var viewVecZ = finalZ + p.camDist;
                                for (var fIdx = 0; fIdx < belongingFaces.length; fIdx++) {
                                    var fName = belongingFaces[fIdx];
                                    var n = rotatedFaces[fName];
                                    var dotProd = viewVecX * n.x + viewVecY * n.y + viewVecZ * n.z;
                                    if (dotProd < 0) {
                                        isVisibleFromCamera = true;
                                        visibleFacesForLighting.push(fName); 
                                    }
                                }
                            }
                        } else {
                            visibleFacesForLighting = belongingFaces;
                        }

                        if (!isVisibleFromCamera) continue;

                        var effectScale = 1.0;
                        if (p.effectMode === "gradient") {
                            var currProj = x * vecX + y * vecY + z * vecZ;
                            var t = (currProj - minProj) / projLength;
                            if (t < 0) t = 0; if (t > 1) t = 1;
                            effectScale = p.valStart + t * (p.valEnd - p.valStart);
                        } else if (p.effectMode === "lighting") {
                            var maxLight = 0;
                            if (visibleFacesForLighting.length > 0) {
                                for (var fIdx=0; fIdx < visibleFacesForLighting.length; fIdx++) {
                                    var fName = visibleFacesForLighting[fIdx];
                                    var n = rotatedFaces[fName];
                                    var dotProd = n.x * vecX + n.y * vecY + n.z * vecZ;
                                    if (dotProd < 0) dotProd = 0;
                                    if (dotProd > maxLight) maxLight = dotProd;
                                }
                            }
                            effectScale = p.valEnd + maxLight * (p.valStart - p.valEnd);
                        }

                        var dist = p.camDist + finalZ;
                        if (dist <= 0) continue; 
                        var persScale = p.focalLength / dist;
                        var projX = finalX * persScale;
                        var projY = finalY * persScale;
                        var totalScale = persScale * effectScale; 

                        results.push({
                            x: projX,
                            y: projY,
                            scale: totalScale,
                            depth: finalZ,
                            gridX: i,
                            gridY: j,
                            gridZ: k,
                            charContent: ""
                        });
                    }
                }
            }
            return results;
        }

        // テキスト文字の割り当て
        function assignTextChars(dots, p) {
            if (p.shapeMode !== "text") return;

            if (p.isTextSeq) {
                dots.sort(function(a, b) {
                    var key1 = p.sortOrder[0];
                    var dir1 = (key1==="x") ? p.dirX : (key1==="y" ? p.dirY : p.dirZ);
                    var val1A = (key1==="x") ? a.gridX : (key1==="y" ? a.gridY : a.gridZ);
                    var val1B = (key1==="x") ? b.gridX : (key1==="y" ? b.gridY : b.gridZ);
                    
                    if (val1A !== val1B) {
                        return (dir1 === 0) ? (val1A - val1B) : (val1B - val1A);
                    }

                    var key2 = p.sortOrder[1];
                    var dir2 = (key2==="x") ? p.dirX : (key2==="y" ? p.dirY : p.dirZ);
                    var val2A = (key2==="x") ? a.gridX : (key2==="y" ? a.gridY : a.gridZ);
                    var val2B = (key2==="x") ? b.gridX : (key2==="y" ? b.gridY : b.gridZ);

                    if (val2A !== val2B) {
                        return (dir2 === 0) ? (val2A - val2B) : (val2B - val2A);
                    }

                    var key3 = p.sortOrder[2];
                    var dir3 = (key3==="x") ? p.dirX : (key3==="y" ? p.dirY : p.dirZ);
                    var val3A = (key3==="x") ? a.gridX : (key3==="y" ? a.gridY : a.gridZ);
                    var val3B = (key3==="x") ? b.gridX : (key3==="y" ? b.gridY : b.gridZ);

                    return (dir3 === 0) ? (val3A - val3B) : (val3B - val3A);
                });

                for (var i = 0; i < dots.length; i++) {
                    dots[i].charContent = p.textString.charAt(i % p.textString.length);
                }

            } else {
                for (var i = 0; i < dots.length; i++) {
                    var rIdx = Math.floor(Math.random() * p.textString.length);
                    dots[i].charContent = p.textString.charAt(rIdx);
                }
            }
        }


        btnOk.onClick = function() {
            try {
                var params = getParamsFromUI();
                var dots = calculateDots(params);
                
                if (dots.length > 10000) {
                    var confirmWin = new Window("dialog", "確認");
                    confirmWin.orientation = "column";
                    confirmWin.alignChildren = ["fill", "top"];
                    var msg = "生成個数が 10,000個 を超えています（約 " + dots.length + " 個）。\n処理に時間がかかる可能性がありますが、生成しますか？";
                    confirmWin.add("statictext", undefined, msg, {multiline: true});
                    var btnGroup = confirmWin.add("group");
                    btnGroup.alignment = "center";
                    var btnNo = btnGroup.add("button", undefined, "生成しない");
                    var btnYes = btnGroup.add("button", undefined, "生成する");
                    
                    btnNo.onClick = function() { confirmWin.close(0); };
                    btnYes.onClick = function() {
                        try {
                            assignTextChars(dots, params);
                            finalDots = dots; finalParams = params; isConfirmed = true;
                            confirmWin.close(1); dialog.close(1);
                        } catch(e) {
                            alert("生成処理中にエラーが発生しました: " + e);
                            confirmWin.close(0);
                        }
                    };
                    confirmWin.show();
                } else {
                    assignTextChars(dots, params);
                    finalDots = dots; finalParams = params; isConfirmed = true;
                    dialog.close(1);
                }
            } catch(e) {
                alert("パラメータ計算中にエラーが発生しました: " + e);
            }
        }


        // =========================================================
        // 描画フェーズ
        // =========================================================
        dialog.show();

        if (!isConfirmed) return;

        finalDots.sort(function(a, b) {
            return b.depth - a.depth;
        });

        var doc = app.activeDocument;
        var d = new Date();
        var masterGroup = doc.groupItems.add();
        masterGroup.name = "3D_V7.6_" + d.getHours() + d.getMinutes() + d.getSeconds();

        var blackColor = new CMYKColor();
        blackColor.black = 100;

        for (var m = 0; m < finalDots.length; m++) {
            var dot = finalDots[m];
            var p = finalParams;
            
            var baseS = 10;
            if (p.shapeMode === "circle") baseS = p.baseDia;
            else if (p.shapeMode === "rect") baseS = p.baseW; 
            else baseS = p.baseTextSize;

            var finalS = baseS * dot.scale;
            if (finalS < 0.1) continue;

            var newItem;
            if (p.shapeMode === "circle") {
                newItem = masterGroup.pathItems.ellipse(dot.y+(finalS/2), dot.x-(finalS/2), finalS, finalS);
                newItem.filled = true; newItem.fillColor = blackColor; newItem.stroked = false;
            } else if (p.shapeMode === "rect") {
                var finalW = p.baseW * dot.scale; var finalH = p.baseH * dot.scale;
                newItem = masterGroup.pathItems.rectangle(dot.y+(finalH/2), dot.x-(finalW/2), finalW, finalH);
                newItem.filled = true; newItem.fillColor = blackColor; newItem.stroked = false;
            } else {
                newItem = masterGroup.textFrames.add();
                newItem.contents = dot.charContent;
                newItem.position = [dot.x, dot.y]; 
                newItem.textRange.characterAttributes.size = finalS;
                newItem.textRange.characterAttributes.fillColor = blackColor;
                newItem.textRange.paragraphAttributes.justification = Justification.CENTER;
            }
        }

        // 位置合わせ (Center to Artboard Center)
        var abIndex = doc.artboards.getActiveArtboardIndex();
        var abRect = doc.artboards[abIndex].artboardRect;
        var abCenterX = (abRect[0] + abRect[2]) / 2;
        var abCenterY = (abRect[1] + abRect[3]) / 2;

        var gb = masterGroup.geometricBounds;
        var groupCenterX = (gb[0] + gb[2]) / 2;
        var groupCenterY = (gb[1] + gb[3]) / 2;

        masterGroup.translate(abCenterX - groupCenterX, abCenterY - groupCenterY);

        if (finalParams.createLog) {
            var logTextFrame = doc.textFrames.add();
            var p = finalParams;
            var logContent = "Output Log:\r"; 
            logContent += "[ドット] " + p.countX + " x " + p.countY + " x " + p.countZ + "\r";
            
            var frameStat = (p.outputMode === 2) ? "オン" : (p.showFrame ? "オン" : "オフ");
            var faceStat = p.isOpaque ? "不透過" : "透過";
            logContent += "[出力] " + p.outputModeStr + " / フレーム: " + frameStat + " / 面: " + faceStat + "\r";
            
            var shapeDetail = "";
            if (p.shapeMode === "circle") {
                shapeDetail = "丸 (直径: " + p.baseDia + " pt)";
            } else if (p.shapeMode === "rect") {
                shapeDetail = "四角 (幅: " + p.baseW + " pt / 高さ: " + p.baseH + " pt)";
            } else {
                var seqInfo = "";
                if (p.isTextSeq) {
                    seqInfo = " (リピート / 埋める順: " + p.orderLabel + " / 始点: " + p.startLabel + " / サイズ: " + p.baseTextSize + " pt)";
                } else {
                    seqInfo = " (ランダム / サイズ: " + p.baseTextSize + " pt)";
                }
                shapeDetail = "文字: \"" + p.textString + "\"" + seqInfo;
            }
            logContent += "[シェイプ] " + shapeDetail + " / 間隔: " + p.pitch + " pt\r";
            
            logContent += "[回転] X: " + p.rotXDeg + "° / Y: " + p.rotYDeg + "° / Z: " + p.rotZDeg + "°\r";
            logContent += "[カメラ] " + p.camStr + "\r";
            
            var effStr = "なし";
            if (p.effectMode === "gradient") {
                // [変更] ログ出力フォーマットを更新
                effStr = "グラデーション (角度: H" + p.effAngH + "° V" + p.effAngV + "° / 範囲: " + (p.valStart*100) + "% -> " + (p.valEnd*100) + "%)";
            } else if (p.effectMode === "lighting") {
                // [変更] ログ出力フォーマットを更新
                effStr = "ライティング (角度: H" + p.effAngH + "° V" + p.effAngV + "° / 範囲: " + (p.valStart*100) + "% -> " + (p.valEnd*100) + "%)";
            }
            logContent += "[効果] " + effStr + "\r";
            
            logContent += "[モデル] 3D Halftone V7.6";

            logTextFrame.contents = logContent;
            logTextFrame.textRange.characterAttributes.size = 5;
            
            var newGb = masterGroup.geometricBounds;
            var patternLeft = newGb[0];
            var patternBottom = newGb[3]; 
            logTextFrame.position = [patternLeft, patternBottom - 15];
        }

    } catch(e) {
        alert("予期せぬエラーが発生しました: " + e);
    }
})();