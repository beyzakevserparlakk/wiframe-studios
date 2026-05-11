document.addEventListener('DOMContentLoaded', () => {
    const canvas = new fabric.Canvas('canvas', {
        width: 1000,
        height: 700,
        backgroundColor: '#ffffff'
    });

    // Elements
    const toolbarBtns = document.querySelectorAll('.tool-btn');
    const fillColorInput = document.getElementById('fill-color');
    const opacityInput = document.getElementById('opacity');
    const strokeColorInput = document.getElementById('stroke-color');
    const strokeWidthInput = document.getElementById('stroke-width');
    const fontSizeInput = document.getElementById('font-size');
    const textColorInput = document.getElementById('text-color');
    const fontFamilyInput = document.getElementById('font-family');
    const cornerRadiusInput = document.getElementById('corner-radius');
    const canvasWidthInput = document.getElementById('canvas-width');
    const canvasHeightInput = document.getElementById('canvas-height');
    const deleteBtn = document.getElementById('delete-obj');
    const noSelectionMsg = document.getElementById('no-selection');
    const selectionProps = document.getElementById('selection-props');
    const textProps = document.getElementById('text-props');

    let currentTool = 'select';

    // Tool Selection
    toolbarBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toolbarBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTool = btn.dataset.tool;

            // Set selection mode based on tool
            canvas.selection = (currentTool === 'select');
            canvas.forEachObject(obj => {
                obj.selectable = (currentTool === 'select');
            });
        });
    });

    // Canvas Events
    canvas.on('mouse:down', (options) => {
        if (currentTool === 'select') return;

        const pointer = canvas.getPointer(options.e);
        let newObj;

        switch (currentTool) {
            case 'rect':
                newObj = new fabric.Rect({
                    left: pointer.x,
                    top: pointer.y,
                    fill: '#6366f1',
                    width: 100,
                    height: 100,
                    rx: 8,
                    ry: 8
                });
                break;
            case 'circle':
                newObj = new fabric.Circle({
                    left: pointer.x,
                    top: pointer.y,
                    fill: '#6366f1',
                    radius: 50
                });
                break;
            case 'text':
                newObj = new fabric.IText('Yeni Metin', {
                    left: pointer.x,
                    top: pointer.y,
                    fontSize: 20,
                    fontFamily: 'Inter',
                    fill: '#333333'
                });
                break;
            case 'image':
                // For demo, just add a placeholder or let user know
                alert('Görsel ekleme özelliği için dosya seçici eklenebilir.');
                return;
        }

        if (newObj) {
            canvas.add(newObj);
            canvas.setActiveObject(newObj);
            // Switch back to select tool
            document.querySelector('[data-tool="select"]').click();
        }
    });

    // Selection Handling
    canvas.on('selection:created', updatePropsPanel);
    canvas.on('selection:updated', updatePropsPanel);
    canvas.on('selection:cleared', () => {
        noSelectionMsg.classList.remove('hidden');
        selectionProps.classList.add('hidden');
    });

    function updatePropsPanel() {
        const activeObj = canvas.getActiveObject();
        if (!activeObj) return;

        noSelectionMsg.classList.add('hidden');
        selectionProps.classList.remove('hidden');

        // Update inputs to match object
        // For groups, we take values from the first object or group defaults
        fillColorInput.value = activeObj.fill || (activeObj._objects ? activeObj._objects[0].fill : '#6366f1');
        opacityInput.value = activeObj.opacity;
        strokeColorInput.value = activeObj.stroke || (activeObj._objects ? activeObj._objects[0].stroke : '#000000');
        strokeWidthInput.value = activeObj.strokeWidth || (activeObj._objects ? activeObj._objects[0].strokeWidth : 0);
        cornerRadiusInput.value = activeObj.rx || (activeObj._objects ? activeObj._objects[0].rx : 0);

        // Check if object or any child in group is text
        const hasText = activeObj.type.includes('text') || 
                       (activeObj._objects && activeObj._objects.some(obj => obj.type.includes('text')));

        if (hasText) {
            textProps.classList.remove('hidden');
            const textObj = activeObj.type.includes('text') ? activeObj : activeObj._objects.find(obj => obj.type.includes('text'));
            fontSizeInput.value = textObj.fontSize;
            textColorInput.value = textObj.fill;
            fontFamilyInput.value = textObj.fontFamily;
        } else {
            textProps.classList.add('hidden');
        }
    }

    // Property Updates
    fillColorInput.addEventListener('input', (e) => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            if (activeObj._objects) {
                activeObj._objects.forEach(obj => {
                    if (obj.type !== 'i-text' && obj.type !== 'text') {
                        obj.set('fill', e.target.value);
                    }
                });
            } else {
                activeObj.set('fill', e.target.value);
            }
            canvas.renderAll();
        }
    });

    textColorInput.addEventListener('input', (e) => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            if (activeObj._objects) {
                activeObj._objects.forEach(obj => {
                    if (obj.type.includes('text')) obj.set('fill', e.target.value);
                });
            } else if (activeObj.type.includes('text')) {
                activeObj.set('fill', e.target.value);
            }
            canvas.renderAll();
        }
    });

    fontFamilyInput.addEventListener('change', (e) => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            if (activeObj._objects) {
                activeObj._objects.forEach(obj => {
                    if (obj.type.includes('text')) obj.set('fontFamily', e.target.value);
                });
            } else if (activeObj.type.includes('text')) {
                activeObj.set('fontFamily', e.target.value);
            }
            canvas.renderAll();
        }
    });

    cornerRadiusInput.addEventListener('input', (e) => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            const val = parseInt(e.target.value, 10);
            if (activeObj._objects) {
                activeObj._objects.forEach(obj => {
                    if (obj.type === 'rect') {
                        obj.set({ rx: val, ry: val });
                    }
                });
            } else if (activeObj.type === 'rect') {
                activeObj.set({ rx: val, ry: val });
            }
            canvas.renderAll();
        }
    });

    canvasWidthInput.addEventListener('change', (e) => {
        const val = parseInt(e.target.value, 10);
        if (val >= 100) {
            canvas.setWidth(val);
            canvas.renderAll();
        }
    });

    canvasHeightInput.addEventListener('change', (e) => {
        const val = parseInt(e.target.value, 10);
        if (val >= 100) {
            canvas.setHeight(val);
            canvas.renderAll();
        }
    });

    // Manual Canvas Resize via Handle
    const resizeHandle = document.getElementById('canvas-resize-handle');
    let isResizing = false;

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        e.preventDefault();
        e.stopPropagation();
    });

    window.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const canvasElement = canvas.getElement();
        const rect = canvasElement.getBoundingClientRect();
        
        const newWidth = e.clientX - rect.left;
        const newHeight = e.clientY - rect.top;

        if (newWidth >= 100) {
            canvas.setWidth(newWidth);
            canvasWidthInput.value = Math.round(newWidth);
        }
        if (newHeight >= 100) {
            canvas.setHeight(newHeight);
            canvasHeightInput.value = Math.round(newHeight);
        }
        
        canvas.renderAll();
    });

    window.addEventListener('mouseup', () => {
        isResizing = false;
    });

    opacityInput.addEventListener('input', (e) => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            activeObj.set('opacity', parseFloat(e.target.value));
            canvas.renderAll();
        }
    });

    strokeColorInput.addEventListener('input', (e) => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            if (activeObj._objects) {
                activeObj._objects.forEach(obj => {
                    obj.set('stroke', e.target.value);
                });
            } else {
                activeObj.set('stroke', e.target.value);
            }
            canvas.renderAll();
        }
    });

    strokeWidthInput.addEventListener('input', (e) => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            if (activeObj._objects) {
                activeObj._objects.forEach(obj => {
                    obj.set('strokeWidth', parseInt(e.target.value, 10));
                });
            } else {
                activeObj.set('strokeWidth', parseInt(e.target.value, 10));
            }
            canvas.renderAll();
        }
    });

    fontSizeInput.addEventListener('input', (e) => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            const size = parseInt(e.target.value, 10);
            if (activeObj._objects) {
                activeObj._objects.forEach(obj => {
                    if (obj.type.includes('text')) obj.set('fontSize', size);
                });
            } else if (activeObj.type.includes('text')) {
                activeObj.set('fontSize', size);
            }
            canvas.renderAll();
        }
    });

    deleteBtn.addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            canvas.remove(activeObj);
            canvas.discardActiveObject();
        }
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
        // Delete or Backspace → delete selected
        if (e.key === 'Delete' || e.key === 'Backspace') {
            // Don't delete when typing in an input
            if (document.activeElement.tagName === 'INPUT' || 
                document.activeElement.tagName === 'TEXTAREA' ||
                document.activeElement.tagName === 'SELECT') return;

            const activeObj = canvas.getActiveObject();
            if (activeObj) {
                // Don't delete while editing text
                if (activeObj.isEditing) return;
                canvas.remove(activeObj);
                canvas.discardActiveObject();
                canvas.renderAll();
            }
        }

        // Escape → deselect
        if (e.key === 'Escape') {
            canvas.discardActiveObject();
            canvas.renderAll();
        }
    });

    // Top Actions
    document.getElementById('clear-canvas').addEventListener('click', () => {
        if (confirm('Tüm çalışmayı temizlemek istediğinize emin misiniz?')) {
            canvas.clear();
            canvas.backgroundColor = '#ffffff';
            canvas.renderAll();
        }
    });

    document.getElementById('export-json').addEventListener('click', () => {
        const json = JSON.stringify(canvas.toJSON());
        console.log(json);
        alert('JSON verisi konsola yazdırıldı (Geliştirme aşamasında dosya olarak indirilebilir).');
    });

    document.getElementById('export-png').addEventListener('click', () => {
        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1
        });
        const link = document.createElement('a');
        link.download = 'planify-wireframe.png';
        link.href = dataURL;
        link.click();
    });

    // Drag and Drop Implementation
    const paletteItems = document.querySelectorAll('.palette-item');
    const wrapper = document.getElementById('canvas-container-wrapper');

    paletteItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('type', item.dataset.type);
            item.style.opacity = '0.5';
        });

        item.addEventListener('dragend', () => {
            item.style.opacity = '1';
        });
    });

    wrapper.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });

    wrapper.addEventListener('drop', (e) => {
        e.preventDefault();
        
        // Handle Files (External Drag and Drop)
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (f) => {
                    const data = f.target.result;
                    fabric.Image.fromURL(data, (newImg) => {
                        // Get drop coordinates
                        const canvasOffset = canvas.getElement().getBoundingClientRect();
                        const x = e.clientX - canvasOffset.left;
                        const y = e.clientY - canvasOffset.top;

                        // Check if dropped on a placeholder
                        const targets = canvas.findTarget(e, true);
                        if (targets && targets.subTargets && targets.subTargets[0] && targets.subTargets[0].name === 'image-placeholder') {
                            const group = targets;
                            const placeholder = targets.subTargets[0];
                            
                            // Get absolute position of the placeholder
                            const worldPos = fabric.util.transformPoint(
                                { x: placeholder.left, y: placeholder.top },
                                group.calcTransformMatrix()
                            );

                            newImg.set({
                                left: worldPos.x,
                                top: worldPos.y,
                                originX: 'center',
                                originY: 'center'
                            });
                            const scale = Math.min(placeholder.width / newImg.width, placeholder.height / newImg.height);
                            newImg.scale(scale * group.scaleX);
                            
                            group.addWithUpdate(newImg);
                            group.removeWithUpdate(placeholder);
                            canvas.renderAll();
                        } else {
                            // Just add as a standalone image
                            newImg.set({ left: x, top: y, originX: 'center', originY: 'center' });
                            newImg.scale(0.5);
                            canvas.add(newImg);
                            canvas.renderAll();
                        }
                    });
                };
                reader.readAsDataURL(file);
            }
            return;
        }

        // Handle Palette Items (Internal Drag and Drop)
        const type = e.dataTransfer.getData('type');
        if (type) {
            const canvasOffset = canvas.getElement().getBoundingClientRect();
            const x = e.clientX - canvasOffset.left;
            const y = e.clientY - canvasOffset.top;
            createComponent(type, x, y);
        }
    });

    function createComponent(type, x, y) {
        let obj;
        switch (type) {
            case 'button':
                const rect = new fabric.Rect({
                    width: 140,
                    height: 44,
                    fill: '#6366f1',
                    rx: 8,
                    ry: 8
                });
                const text = new fabric.IText('Button', {
                    fontSize: 16,
                    fill: '#ffffff',
                    originX: 'center',
                    originY: 'center',
                    left: 70,
                    top: 22
                });
                obj = new fabric.Group([rect, text], {
                    left: x,
                    top: y
                });
                break;
            case 'input':
                const inputRect = new fabric.Rect({
                    width: 200,
                    height: 40,
                    fill: '#ffffff',
                    stroke: '#cbd5e1',
                    strokeWidth: 1,
                    rx: 6,
                    ry: 6
                });
                const placeholder = new fabric.IText('Placeholder...', {
                    fontSize: 14,
                    fill: '#94a3b8',
                    left: 12,
                    top: 13
                });
                obj = new fabric.Group([inputRect, placeholder], {
                    left: x,
                    top: y
                });
                break;
            case 'card':
                obj = new fabric.Rect({
                    left: x,
                    top: y,
                    width: 240,
                    height: 160,
                    fill: '#ffffff',
                    stroke: '#e2e8f0',
                    strokeWidth: 1,
                    rx: 12,
                    ry: 12,
                    shadow: {
                        color: 'rgba(0,0,0,0.1)',
                        blur: 20,
                        offsetX: 0,
                        offsetY: 10
                    }
                });
                break;
            case 'heading':
                obj = new fabric.IText('Görkemli Başlık', {
                    left: x,
                    top: y,
                    fontSize: 32,
                    fontWeight: 800,
                    fill: '#1e293b'
                });
                break;
            case 'navbar':
                const nWidth = 400; // Narrower width
                const nHeight = 50;
                
                const navBg = new fabric.Rect({
                    width: nWidth,
                    height: nHeight,
                    fill: '#ffffff',
                    stroke: '#e2e8f0',
                    strokeWidth: 1,
                    rx: 8,
                    ry: 8,
                    originX: 'center',
                    originY: 'center'
                });

                const navLogo = new fabric.IText('LOGO', {
                    fontSize: 16,
                    fontWeight: 800,
                    fontFamily: 'Inter',
                    fill: '#1e293b',
                    left: -(nWidth / 2) + 40,
                    top: 0,
                    originX: 'center',
                    originY: 'center'
                });

                const navLinks = new fabric.IText('Home  About  Contact', {
                    fontSize: 12,
                    fontFamily: 'Inter',
                    fill: '#64748b',
                    left: (nWidth / 2) - 80,
                    top: 0,
                    originX: 'center',
                    originY: 'center'
                });

                obj = new fabric.Group([navBg, navLogo, navLinks], {
                    left: x,
                    top: y,
                    originX: 'center',
                    originY: 'center'
                });
                break;
            case 'dropdown':
                const dWidth = 180;
                const dHeight = 160;
                const dColor = '#1e1b4b'; 
                
                const container = new fabric.Rect({
                    width: dWidth,
                    height: dHeight,
                    fill: '#ffffff',
                    stroke: '#d1d5db',
                    strokeWidth: 1,
                    rx: 16,
                    ry: 16,
                    originX: 'center',
                    originY: 'center'
                });

                const mItem1 = new fabric.IText('Menu Item', {
                    fontSize: 15,
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    fill: dColor,
                    top: -45,
                    originX: 'center',
                    originY: 'center'
                });

                const activeBox = new fabric.Rect({
                    width: dWidth - 24,
                    height: 44,
                    fill: dColor,
                    rx: 10,
                    ry: 10,
                    top: 0,
                    originX: 'center',
                    originY: 'center'
                });

                const mItem2 = new fabric.IText('Menu Item', {
                    fontSize: 15,
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    fill: '#ffffff',
                    top: 0,
                    originX: 'center',
                    originY: 'center'
                });

                const mItem3 = new fabric.IText('Menu Item', {
                    fontSize: 15,
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    fill: dColor,
                    top: 45,
                    originX: 'center',
                    originY: 'center'
                });

                obj = new fabric.Group([container, mItem1, activeBox, mItem2, mItem3], {
                    left: x,
                    top: y,
                    originX: 'center',
                    originY: 'center'
                });
                break;
            case 'grid-2x2':
            case 'grid-3x3':
            case 'grid-4x4':
            case 'grid-6x6':
                const gridSize = parseInt(type.split('x')[1]); // e.g., 2 from grid-2x2
                const gridItems = [];
                const boxSize = 80;
                const gridGap = 10;
                const totalSize = gridSize * boxSize + (gridSize - 1) * gridGap;

                for (let r = 0; r < gridSize; r++) {
                    for (let c = 0; c < gridSize; c++) {
                        const boxX = c * (boxSize + gridGap) - totalSize / 2 + boxSize / 2;
                        const boxY = r * (boxSize + gridGap) - totalSize / 2 + boxSize / 2;
                        
                        gridItems.push(new fabric.Rect({
                            width: boxSize,
                            height: boxSize,
                            fill: '#f8fafc',
                            stroke: '#e2e8f0',
                            strokeWidth: 1,
                            left: boxX,
                            top: boxY,
                            originX: 'center',
                            originY: 'center',
                            rx: 4,
                            ry: 4,
                            name: 'image-placeholder'
                        }));
                        
                        // Add a placeholder icon for images
                        gridItems.push(new fabric.IText('🖼️', {
                            fontSize: 24,
                            left: boxX,
                            top: boxY,
                            originX: 'center',
                            originY: 'center',
                            fill: '#94a3b8',
                            opacity: 0.5,
                            selectable: false,
                            evented: false
                        }));
                    }
                }
                obj = new fabric.Group(gridItems, {
                    left: x,
                    top: y,
                    originX: 'center',
                    originY: 'center',
                    subTargetCheck: true
                });

                // Image change handler for grids
                obj.on('mousedblclick', (options) => {
                    if (options.subTargets && options.subTargets[0] && options.subTargets[0].name === 'image-placeholder') {
                        const target = options.subTargets[0];
                        const imageUpload = document.getElementById('image-upload');
                        
                        imageUpload.onchange = (e) => {
                            const file = e.target.files[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (f) => {
                                    const data = f.target.result;
                                    fabric.Image.fromURL(data, (newImg) => {
                                        const worldPos = fabric.util.transformPoint(
                                            { x: target.left, y: target.top },
                                            obj.calcTransformMatrix()
                                        );
                                        newImg.set({
                                            left: worldPos.x,
                                            top: worldPos.y,
                                            originX: 'center',
                                            originY: 'center'
                                        });
                                        const scale = Math.min(target.width / newImg.width, target.height / newImg.height);
                                        newImg.scale(scale * obj.scaleX);
                                        obj.addWithUpdate(newImg);
                                        obj.removeWithUpdate(target);
                                        imageUpload.value = '';
                                        canvas.renderAll();
                                    });
                                };
                                reader.readAsDataURL(file);
                            }
                        };
                        imageUpload.click();
                    }
                });
                break;
            case 'blog-grid':
                const cardWidth = 240;
                const cardHeight = 400;
                const gap = 20;
                const cards = [];

                for (let i = 0; i < 3; i++) {
                    const cardX = (i - 1) * (cardWidth + gap);
                    
                    const cardContainer = new fabric.Rect({
                        width: cardWidth,
                        height: cardHeight,
                        fill: '#ffffff',
                        stroke: '#e5e7eb',
                        strokeWidth: 1,
                        left: cardX,
                        top: 0,
                        originX: 'center',
                        originY: 'center'
                    });

                    const imgPlace = new fabric.Rect({
                        width: cardWidth,
                        height: 180,
                        fill: '#f3f4f6',
                        left: cardX,
                        top: -110,
                        originX: 'center',
                        originY: 'center',
                        name: 'image-placeholder'
                    });

                    const imgIcon = new fabric.IText('🖼️', {
                        fontSize: 40,
                        left: cardX,
                        top: -110,
                        originX: 'center',
                        originY: 'center',
                        selectable: false,
                        evented: false
                    });

                    const category = new fabric.IText('Category', {
                        fontSize: 12,
                        fill: '#6b7280',
                        left: cardX - cardWidth/2 + 20,
                        top: 0,
                        originY: 'center'
                    });

                    const title = new fabric.IText('Blog title heading goes here', {
                        fontSize: 18,
                        fontWeight: 800,
                        fill: '#1f2937',
                        width: cardWidth - 40,
                        left: cardX - cardWidth/2 + 20,
                        top: 40,
                        originY: 'center'
                    });

                    const desc = new fabric.IText('Lorem ipsum dolor sit amet et\ndelectus accommodare his\nconsul copiosae.', {
                        fontSize: 13,
                        fill: '#4b5563',
                        lineHeight: 1.4,
                        left: cardX - cardWidth/2 + 20,
                        top: 100,
                        originY: 'center'
                    });

                    const readMore = new fabric.IText('Read more', {
                        fontSize: 14,
                        fontWeight: 600,
                        fill: '#374151',
                        left: cardX - cardWidth/2 + 20,
                        top: 160,
                        originY: 'center'
                    });

                    cards.push(cardContainer, imgPlace, imgIcon, category, title, desc, readMore);
                }

                obj = new fabric.Group(cards, {
                    left: x,
                    top: y,
                    originX: 'center',
                    originY: 'center',
                    subTargetCheck: true
                });

                // Image change handler
                obj.on('mousedblclick', (options) => {
                    if (options.subTargets && options.subTargets[0] && options.subTargets[0].name === 'image-placeholder') {
                        const target = options.subTargets[0];
                        const imageUpload = document.getElementById('image-upload');
                        
                        // Temporary storage to use in the change listener
                        imageUpload.onchange = (e) => {
                            const file = e.target.files[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (f) => {
                                    const data = f.target.result;
                                    fabric.Image.fromURL(data, (newImg) => {
                                        // Get absolute position of the placeholder
                                        const worldPos = fabric.util.transformPoint(
                                            { x: target.left, y: target.top },
                                            obj.calcTransformMatrix()
                                        );

                                        newImg.set({
                                            left: worldPos.x,
                                            top: worldPos.y,
                                            originX: 'center',
                                            originY: 'center'
                                        });

                                        const scale = Math.min(target.width / newImg.width, target.height / newImg.height);
                                        newImg.scale(scale * obj.scaleX); // Account for group scale

                                        obj.addWithUpdate(newImg);
                                        obj.removeWithUpdate(target);
                                        
                                        imageUpload.value = '';
                                        canvas.renderAll();
                                    });
                                };
                                reader.readAsDataURL(file);
                            }
                        };
                        imageUpload.click();
                    }
                });
                break;
        }


        if (obj) {
            canvas.add(obj);
            canvas.setActiveObject(obj);
            canvas.renderAll();
        }
    }

    // Handle Resize
    window.addEventListener('resize', () => {
        // Simple resize logic if needed
    });
});

