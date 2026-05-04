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
        fillColorInput.value = activeObj.fill;
        opacityInput.value = activeObj.opacity;
        strokeColorInput.value = activeObj.stroke || '#000000';
        strokeWidthInput.value = activeObj.strokeWidth || 0;

        if (activeObj.type === 'i-text' || activeObj.type === 'text') {
            textProps.classList.remove('hidden');
            fontSizeInput.value = activeObj.fontSize;
        } else {
            textProps.classList.add('hidden');
        }
    }

    // Property Updates
    fillColorInput.addEventListener('input', (e) => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            activeObj.set('fill', e.target.value);
            canvas.renderAll();
        }
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
            activeObj.set('stroke', e.target.value);
            canvas.renderAll();
        }
    });

    strokeWidthInput.addEventListener('input', (e) => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            activeObj.set('strokeWidth', parseInt(e.target.value, 10));
            canvas.renderAll();
        }
    });

    fontSizeInput.addEventListener('input', (e) => {
        const activeObj = canvas.getActiveObject();
        if (activeObj && (activeObj.type === 'i-text' || activeObj.type === 'text')) {
            activeObj.set('fontSize', parseInt(e.target.value, 10));
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

    // Handle Resize
    window.addEventListener('resize', () => {
        // Simple resize logic if needed
    });
});
