// Variables globales
let currentSubtitles = null;
let currentAudioUrl = null;
let currentAudioFilename = null;
let presetsCache = null;
let presetsAppliedInitially = false;
let currentMergedVideoUrl = null;
let currentLoopVideoUrl = null;

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando aplicación...');
    initializeApp();
    setupTabSystem();
    setupEventListeners();
    loadServerConfig();
});

// Inicializar aplicación
function initializeApp() {
    console.log('🚀 Inicializando aplicación...');
    
    // Detectar tema del sistema
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    console.log(`🌐 Tema del sistema detectado: ${systemTheme}`);
    
    // Obtener preferencia del usuario
    const userChangedTheme = localStorage.getItem('userChangedTheme') === 'true';
    const savedTheme = localStorage.getItem('theme');
    
    console.log(`👤 Usuario cambió tema manualmente: ${userChangedTheme}`);
    console.log(`💾 Tema guardado: ${savedTheme}`);
    
    let themeToApply;
    
    if (userChangedTheme && savedTheme) {
        // Usuario cambió manualmente el tema
        themeToApply = savedTheme;
        console.log(`🎯 Usando tema guardado por usuario: ${themeToApply}`);
    } else if (savedTheme === 'auto' || !savedTheme) {
        // Usar tema del sistema
        themeToApply = systemTheme;
        console.log(`🎯 Usando tema del sistema: ${themeToApply}`);
    } else {
        // Usar tema guardado
        themeToApply = savedTheme;
        console.log(`🎯 Usando tema guardado: ${themeToApply}`);
    }
    
    // Aplicar tema
    applyTheme(themeToApply);
    
    // Escuchar cambios en el tema del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!userChangedTheme) {
            const newSystemTheme = e.matches ? 'dark' : 'light';
            console.log(`🔄 Tema del sistema cambió a: ${newSystemTheme}`);
            applyTheme(newSystemTheme);
        }
    });
    
    console.log('✅ Aplicación inicializada');
}

// Aplicar tema
function applyTheme(theme) {
    console.log(`🎨 Aplicando tema: ${theme}`);
    
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    // Remover todas las clases de tema
    body.classList.remove('dark-theme', 'light-theme');
    body.removeAttribute('data-theme');
    
    if (theme === 'dark') {
        body.classList.add('dark-theme');
        body.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.textContent = '☀️';
        if (themeText) themeText.textContent = 'Modo Claro';
        console.log('🌙 Tema oscuro aplicado');
    } else {
        body.classList.add('light-theme');
        body.setAttribute('data-theme', 'light');
        if (themeIcon) themeIcon.textContent = '🌙';
        if (themeText) themeText.textContent = 'Modo Oscuro';
        console.log('☀️ Tema claro aplicado');
    }
    
    // Guardar tema actual
    localStorage.setItem('theme', theme);
}

// Sistema de pestañas
function setupTabSystem() {
    console.log('🔧 Configurando sistema de pestañas...');
    
    // Event listeners para pestañas
    const tabButtons = document.querySelectorAll('.tab');
    console.log(`📋 Encontradas ${tabButtons.length} pestañas`);
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            console.log(`🔄 Click en pestaña: ${tabId}`);
            if (tabId) {
                switchTab(tabId);
            }
        });
    });
    
    // Inicializar primera pestaña
    const firstTab = document.querySelector('.tab.active');
    if (firstTab) {
        const firstTabId = firstTab.getAttribute('data-tab');
        console.log(`🎯 Primera pestaña activa: ${firstTabId}`);
        if (firstTabId) {
            switchTab(firstTabId);
        }
    } else {
        // Si no hay pestaña activa, activar la primera
        const firstTabButton = document.querySelector('.tab');
        if (firstTabButton) {
            const firstTabId = firstTabButton.getAttribute('data-tab');
            console.log(`🎯 Activando primera pestaña: ${firstTabId}`);
            if (firstTabId) {
                switchTab(firstTabId);
            }
        }
    }
}

function switchTab(tabId) {
    console.log(`🔄 Cambiando a pestaña: ${tabId}`);
    
    // Ocultar todas las pestañas
    const allTabs = document.querySelectorAll('.tab-content');
    console.log(`📋 Ocultando ${allTabs.length} pestañas`);
    allTabs.forEach(tab => {
        tab.style.display = 'none';
        tab.classList.remove('active');
    });
    
    // Remover clase activa de todos los botones
    const allTabButtons = document.querySelectorAll('.tab');
    allTabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar pestaña seleccionada
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.style.display = 'block';
        selectedTab.classList.add('active');
        console.log(`✅ Pestaña ${tabId} mostrada`);
    } else {
        console.error(`❌ Pestaña ${tabId} no encontrada`);
    }
    
    // Activar botón de pestaña
    const selectedButton = document.querySelector(`[data-tab="${tabId}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
        console.log(`✅ Botón de pestaña ${tabId} activado`);
    } else {
        console.error(`❌ Botón de pestaña ${tabId} no encontrado`);
    }
}

// Configurar event listeners
function setupEventListeners() {
    console.log('🎯 Configurando event listeners...');
    
    // Toggle de tema
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Formulario de video
    const videoForm = document.getElementById('videoForm');
    if (videoForm) {
        videoForm.addEventListener('submit', processVideo);
    }
    
    // Input de archivo de video
    const videoFile = document.getElementById('videoFile');
    if (videoFile) {
        videoFile.addEventListener('change', handleFileSelect);
    }
    
    // Formulario de texto a audio
    const textToAudioForm = document.getElementById('textToAudioForm');
    if (textToAudioForm) {
        textToAudioForm.addEventListener('submit', processTextToAudio);
    }
    
    // Input de archivo de texto
    const textFile = document.getElementById('textFile');
    if (textFile) {
        textFile.addEventListener('change', handleTextFileSelect);
    }

    const pitchInput = document.getElementById('pitch');
    const pitchInc = document.getElementById('pitchIncrement');
    const pitchDec = document.getElementById('pitchDecrement');
    function clampPitch(v) { return Math.min(20, Math.max(-20, v)); }
    function setPitch(v) { if (pitchInput) pitchInput.value = clampPitch(parseFloat(v)).toFixed(1); }
    if (pitchInput) {
        pitchInput.addEventListener('input', () => setPitch(pitchInput.value));
        pitchInput.addEventListener('blur', () => setPitch(pitchInput.value));
    }
    if (pitchInc) {
        pitchInc.addEventListener('click', () => { const v = parseFloat(pitchInput.value || '0'); setPitch((v + 0.1).toFixed(1)); });
    }
    if (pitchDec) {
        pitchDec.addEventListener('click', () => { const v = parseFloat(pitchInput.value || '0'); setPitch((v - 0.1).toFixed(1)); });
    }

    const rateInput = document.getElementById('speakingRate');
    const rateInc = document.getElementById('speakingRateIncrement');
    const rateDec = document.getElementById('speakingRateDecrement');
    function clampRate(v) { return Math.min(2.0, Math.max(0.25, v)); }
    function setRate(v) { if (rateInput) rateInput.value = clampRate(parseFloat(v)).toFixed(1); }
    if (rateInput) {
        rateInput.addEventListener('input', () => setRate(rateInput.value));
        rateInput.addEventListener('blur', () => setRate(rateInput.value));
    }
    if (rateInc) {
        rateInc.addEventListener('click', () => { const v = parseFloat(rateInput.value || '1.0'); setRate((v + 0.1).toFixed(1)); });
    }
    if (rateDec) {
        rateDec.addEventListener('click', () => { const v = parseFloat(rateInput.value || '1.0'); setRate((v - 0.1).toFixed(1)); });
    }

    const volInput = document.getElementById('volumeGainDb');
    const volInc = document.getElementById('volumeGainIncrement');
    const volDec = document.getElementById('volumeGainDecrement');
    function clampVol(v) { return Math.min(16.0, Math.max(-16.0, v)); }
    function setVol(v) { if (volInput) volInput.value = clampVol(parseFloat(v)).toFixed(1); }
    if (volInput) {
        volInput.addEventListener('input', () => setVol(volInput.value));
        volInput.addEventListener('blur', () => setVol(volInput.value));
    }
    if (volInc) {
        volInc.addEventListener('click', () => { const v = parseFloat(volInput.value || '0.0'); setVol((v + 0.1).toFixed(1)); });
    }
    if (volDec) {
        volDec.addEventListener('click', () => { const v = parseFloat(volInput.value || '0.0'); setVol((v - 0.1).toFixed(1)); });
    }
    
    // Selector de idioma de voz
    const voiceLanguage = document.getElementById('voiceLanguage');
    if (voiceLanguage) {
        voiceLanguage.addEventListener('change', updateVoiceOptions);
        // Inicializar opciones de voz al cargar la página
        updateVoiceOptions();
    }
    const voiceGender = document.getElementById('voiceGender');
    if (voiceGender) {
        voiceGender.addEventListener('change', updateVoiceOptions);
    }

    const preset1 = document.getElementById('preset1');
    const preset2 = document.getElementById('preset2');
    const preset3 = document.getElementById('preset3');
    const preset4 = document.getElementById('preset4');
    if (preset1) preset1.addEventListener('click', () => applyPreset(1));
    if (preset2) preset2.addEventListener('click', () => applyPreset(2));
    if (preset3) preset3.addEventListener('click', () => applyPreset(3));
    if (preset4) preset4.addEventListener('click', () => applyPreset(4));
    const savePresetBtn = document.getElementById('savePresetBtn');
    if (savePresetBtn) savePresetBtn.addEventListener('click', openPresetModal);

    loadPresets();
    
    // Formulario de unir videos
    const mergeVideosForm = document.getElementById('mergeVideosForm');
    if (mergeVideosForm) {
        mergeVideosForm.addEventListener('submit', processVideoMerge);
    }
    
    // Inputs de video para unir
    for (let i = 1; i <= 4; i++) {
        const videoInput = document.getElementById(`video${i}`);
        if (videoInput) {
            videoInput.addEventListener('change', (e) => handleVideoSelect(e, i));
        }
    }
    
    // Formulario de loop de video
    const loopVideoForm = document.getElementById('loopVideoForm');
    if (loopVideoForm) {
        loopVideoForm.addEventListener('submit', createVideoLoop);
    }
    
    // Input de archivo de loop de video
    const loopVideoFile = document.getElementById('loopVideoFile');
    if (loopVideoFile) {
        loopVideoFile.addEventListener('change', handleLoopVideoSelect);
    }
    
    // Inputs de duración para actualizar vista previa
    const targetMinutes = document.getElementById('targetMinutes');
    const targetSeconds = document.getElementById('targetSeconds');
    if (targetMinutes) {
        targetMinutes.addEventListener('input', updateLoopPreviewOnChange);
    }
    if (targetSeconds) {
        targetSeconds.addEventListener('input', updateLoopPreviewOnChange);
        targetSeconds.addEventListener('blur', formatSecondsInput);
    }
    
    // Formulario de configuración
    const configForm = document.getElementById('configForm');
    if (configForm) {
        configForm.addEventListener('submit', saveServerConfig);
    }
    
    // Botones de gestión de pestañas
    const addTabBtn = document.getElementById('addTabBtn');
    if (addTabBtn) {
        addTabBtn.addEventListener('click', addNewTab);
    }
    
    const showTemplatesBtn = document.getElementById('showTemplatesBtn');
    if (showTemplatesBtn) {
        showTemplatesBtn.addEventListener('click', showTabTemplates);
    }
    
    // Cargar pestañas dinámicas
    loadDynamicTabs();
    
    fetchGcsUsage();
    
    console.log('✅ Event listeners configurados');
}

// Toggle de tema
function toggleTheme() {
    console.log('🔄 Cambiando tema...');
    
    const body = document.body;
    const isDark = body.classList.contains('dark-theme');
    const newTheme = isDark ? 'light' : 'dark';
    
    console.log(`🎨 Cambiando de ${isDark ? 'oscuro' : 'claro'} a ${newTheme === 'dark' ? 'oscuro' : 'claro'}`);
    
    // Marcar que el usuario cambió el tema manualmente
    localStorage.setItem('userChangedTheme', 'true');
    
    applyTheme(newTheme);
    showNotification(`Tema cambiado a ${newTheme === 'dark' ? 'oscuro' : 'claro'}`, 'info');
}

// Cargar configuración del servidor
async function loadServerConfig() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        
        // Actualizar UI con configuración del servidor
        updateServerConfigUI(config);
        
        return config;
    } catch (error) {
        console.error('Error cargando configuración:', error);
        return {};
    }
}

// Actualizar UI con configuración del servidor
function updateServerConfigUI(config) {
    console.log('📋 Configuración del servidor cargada:', config);
    
    // Si el servidor tiene configuración de tema y no hay preferencia del usuario
    if (config.theme && !localStorage.getItem('userChangedTheme')) {
        console.log(`🎨 Aplicando tema desde servidor: ${config.theme}`);
        if (config.theme === 'auto') {
            // Usar tema del sistema
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            applyTheme(systemTheme);
        } else {
            applyTheme(config.theme);
        }
    }
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Procesar video
async function processVideo(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Mostrar progreso
    const progressSection = document.getElementById('progressSection');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    progressSection.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = 'Procesando video...';
    
    try {
        // Simular progreso
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            progressFill.style.width = `${progress}%`;
        }, 500);
        
        const response = await fetch('/api/process', {
            method: 'POST',
            body: formData
        });
        
        clearInterval(progressInterval);
        progressFill.style.width = '100%';
        progressText.textContent = 'Completado!';
        
        const result = await response.json();
        
        if (result.success) {
            // Ocultar progreso
            setTimeout(() => {
                progressSection.style.display = 'none';
            }, 1000);
            
            // Mostrar resultados
            showResults(result);
            showNotification('Video procesado exitosamente', 'success');
        } else {
            throw new Error(result.error || 'Error desconocido');
        }
        
    } catch (error) {
        clearInterval(progressInterval);
        progressSection.style.display = 'none';
        showNotification(`Error: ${error.message}`, 'error');
        console.error('Error procesando video:', error);
    }
}

// Mostrar resultados
function showResults(result) {
    const resultsSection = document.getElementById('resultsSection');
    const originalTranscript = document.getElementById('originalTranscript');
    const translatedTranscript = document.getElementById('translatedTranscript');
    
    // Guardar subtítulos
    currentSubtitles = result.subtitles;
    
    // Mostrar transcripciones
    originalTranscript.textContent = result.original_text;
    translatedTranscript.textContent = result.translated_text;
    
    // Mostrar sección de resultados
    resultsSection.style.display = 'block';
}

// Descargar subtítulos
function downloadSubtitles() {
    if (currentSubtitles) {
        const blob = new Blob([currentSubtitles], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'subtitles.srt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } else {
        showNotification('No hay subtítulos para descargar', 'error');
    }
}

// Manejar selección de archivo de video
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const fileInfo = document.getElementById('videoFileInfo');
        const fileName = fileInfo.querySelector('.file-name');
        const fileSize = fileInfo.querySelector('.file-size');
        
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileInfo.style.display = 'block';
        
        // Agregar clase para indicar que tiene archivo
        const uploadLabel = fileInfo.closest('.file-upload-label');
        if (uploadLabel) {
            uploadLabel.classList.add('has-file');
        }
        
        console.log(`🎬 Video seleccionado: ${file.name} (${formatFileSize(file.size)})`);
    }
}

// Formatear tamaño de archivo
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Procesar texto a audio
async function processTextToAudio(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Mostrar progreso
    const progressSection = document.getElementById('textProgressSection');
    const progressFill = document.getElementById('textProgressFill');
    const progressText = document.getElementById('textProgressText');
    
    progressSection.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = 'Procesando texto...';
    
    let progressInterval;
    
    try {
        // Simular progreso
        let progress = 0;
        progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            progressFill.style.width = `${progress}%`;
        }, 500);
        
        const response = await fetch('/api/text-to-audio', {
            method: 'POST',
            body: formData
        });
        
        clearInterval(progressInterval);
        progressFill.style.width = '100%';
        progressText.textContent = 'Completado!';
        
        const result = await response.json();
        
        if (result.success) {
            // Ocultar progreso
            setTimeout(() => {
                progressSection.style.display = 'none';
            }, 1000);
            
            // Mostrar resultados
            showTextResults(result);
            showNotification('Audio generado exitosamente', 'success');
        } else {
            throw new Error(result.error || 'Error desconocido');
        }
        
    } catch (error) {
        if (progressInterval) {
            clearInterval(progressInterval);
        }
        progressSection.style.display = 'none';
        showNotification(`Error: ${error.message}`, 'error');
        console.error('Error generando audio:', error);
    }
}

// Mostrar resultados de texto a audio
function showTextResults(result) {
    const resultsSection = document.getElementById('textResultsSection');
    const audioPlayer = document.getElementById('audioPlayer');
    const textPreview = document.getElementById('textPreview');
    
    // Guardar URL del audio
    currentAudioUrl = result.audio_url;
    currentAudioFilename = result.filename || 'audio.mp3';
    const lowerName = currentAudioFilename.toLowerCase();
    const mimeType = lowerName.endsWith('.wav') ? 'audio/wav' : lowerName.endsWith('.ogg') ? 'audio/ogg' : 'audio/mpeg';
    
    // Mostrar reproductor de audio
    audioPlayer.innerHTML = `
        <audio controls style="width: 100%;">
            <source src="${result.audio_url}" type="${mimeType}">
            Tu navegador no soporta el elemento audio.
        </audio>
    `;
    
    // Mostrar vista previa del texto
    textPreview.textContent = result.text_preview;
    
    // Mostrar sección de resultados
    resultsSection.style.display = 'block';
}

// Descargar audio
function downloadAudio() {
    if (currentAudioUrl) {
        const link = document.createElement('a');
        link.href = currentAudioUrl;
        link.download = currentAudioFilename || 'audio';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        showNotification('No hay audio para descargar', 'error');
    }
}

// Manejar selección de archivo de texto
function handleTextFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const fileInfo = document.getElementById('textFileInfo');
        const fileName = fileInfo.querySelector('.file-name');
        const fileSize = fileInfo.querySelector('.file-size');
        
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileInfo.style.display = 'block';
        
        // Agregar clase para indicar que tiene archivo
        const uploadLabel = fileInfo.closest('.file-upload-label');
        if (uploadLabel) {
            uploadLabel.classList.add('has-file');
        }
        
        console.log(`📄 Archivo de texto seleccionado: ${file.name} (${formatFileSize(file.size)})`);
    }
}

// Actualizar opciones de voz
function updateVoiceOptions() {
    const voiceLanguage = document.getElementById('voiceLanguage').value;
    const selectedGender = (document.getElementById('voiceGender')?.value || 'female').toLowerCase();
    const voiceNameSelect = document.getElementById('voiceName');
    
    voiceNameSelect.innerHTML = '<option value="">Seleccionar voz...</option>';
    
    const options = getStaticVoiceOptions(voiceLanguage, selectedGender);
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.text;
        voiceNameSelect.appendChild(opt);
    });
    if (options.length > 0) {
        voiceNameSelect.value = options[0].value;
    }
}

function loadPresets() {
    fetch('/api/presets')
        .then(res => res.json())
        .then(data => {
            presetsCache = data && data.presets ? data.presets : {};
            const p1 = presetsCache && presetsCache['1'] ? presetsCache['1'] : null;
            const p2 = presetsCache && presetsCache['2'] ? presetsCache['2'] : null;
            const p3 = presetsCache && presetsCache['3'] ? presetsCache['3'] : null;
            const p4 = presetsCache && presetsCache['4'] ? presetsCache['4'] : null;
            const b1 = document.getElementById('preset1');
            const b2 = document.getElementById('preset2');
            const b3 = document.getElementById('preset3');
            const b4 = document.getElementById('preset4');
            if (p1 && b1) { b1.textContent = p1.name || 'Preajuste 1'; b1.className = 'btn btn-info'; }
            if (p2 && b2) { b2.textContent = p2.name || 'Preajuste 2'; b2.className = 'btn btn-info'; }
            if (p3 && b3) { b3.textContent = p3.name || 'Preajuste 3'; b3.className = 'btn btn-info'; }
            if (p4 && b4) { b4.textContent = p4.name || 'Preajuste 4'; b4.className = 'btn btn-info'; }

            if (!presetsAppliedInitially) {
                applyPreset(1);
                presetsAppliedInitially = true;
            }
        })
        .catch(() => {});
}

function applyPreset(id) {
    const p = presetsCache && presetsCache[String(id)] ? presetsCache[String(id)] : null;
    const voiceLanguageEl = document.getElementById('voiceLanguage');
    const voiceGenderEl = document.getElementById('voiceGender');
    const voiceNameEl = document.getElementById('voiceName');
    const voiceStyleEl = document.getElementById('voiceStyle');
    const effectsEl = document.getElementById('effectsProfileId');
    const pitchEl = document.getElementById('pitch');
    const rateEl = document.getElementById('speakingRate');
    const volEl = document.getElementById('volumeGainDb');
    const formatEl = document.getElementById('audioFormat');
    if (p) {
        if (voiceLanguageEl && p.voice_language) voiceLanguageEl.value = p.voice_language;
        if (voiceGenderEl && p.voice_gender) voiceGenderEl.value = p.voice_gender;
        updateVoiceOptions();
        if (voiceNameEl && p.voice_name) {
            voiceNameEl.value = p.voice_name;
            if (!voiceNameEl.value) {
                const opts = getStaticVoiceOptions(voiceLanguageEl.value, voiceGenderEl.value);
                if (opts.length) voiceNameEl.value = opts[0].value;
            }
        }
        if (voiceStyleEl && p.voice_style) voiceStyleEl.value = p.voice_style;
        if (effectsEl && p.effects_profile_id !== undefined) effectsEl.value = p.effects_profile_id;
        if (pitchEl && p.pitch !== undefined) pitchEl.value = parseFloat(p.pitch).toFixed(1);
        if (rateEl && p.speaking_rate !== undefined) rateEl.value = parseFloat(p.speaking_rate).toFixed(1);
        if (volEl && p.volume_gain_db !== undefined) volEl.value = parseFloat(p.volume_gain_db).toFixed(1);
        if (formatEl && p.audio_format) formatEl.value = p.audio_format;
        showNotification('Preajuste aplicado', 'success');
        return;
    }
    if (id === 1) {
        if (voiceLanguageEl) voiceLanguageEl.value = 'es-ES';
        if (voiceGenderEl) voiceGenderEl.value = 'male';
        updateVoiceOptions();
        if (voiceNameEl) voiceNameEl.value = 'es-ES-Wavenet-G';
        if (voiceStyleEl) voiceStyleEl.value = 'storytelling';
        if (effectsEl) effectsEl.value = 'headphone-class-device';
        if (pitchEl) pitchEl.value = (-0.5).toFixed(1);
        showNotification('Preajuste aplicado', 'success');
    } else {
        return;
    }
}

function openPresetModal() {
    const modal = document.getElementById('presetModal');
    const slotSel = document.getElementById('presetSlot');
    const nameInput = document.getElementById('presetName');
    if (!modal || !slotSel || !nameInput) return;
    const defaultSlot = '1';
    slotSel.value = defaultSlot;
    const existing = presetsCache && presetsCache[defaultSlot] ? presetsCache[defaultSlot].name : `Preajuste ${defaultSlot}`;
    nameInput.value = existing;
    modal.style.display = 'block';
    const confirmBtn = document.getElementById('presetSaveConfirm');
    const cancelBtn = document.getElementById('presetSaveCancel');
    if (confirmBtn) confirmBtn.onclick = confirmPresetSave;
    if (cancelBtn) cancelBtn.onclick = () => { modal.style.display = 'none'; };
}

function confirmPresetSave() {
    const modal = document.getElementById('presetModal');
    const slotSel = document.getElementById('presetSlot');
    const nameInput = document.getElementById('presetName');
    if (!slotSel || !nameInput) return;
    const slot = String(slotSel.value);
    const name = String(nameInput.value || `Preajuste ${slot}`);
    const payload = {
        slot: slot,
        name: name,
        data: {
            voice_language: document.getElementById('voiceLanguage')?.value,
            voice_gender: document.getElementById('voiceGender')?.value,
            voice_name: document.getElementById('voiceName')?.value,
            voice_style: document.getElementById('voiceStyle')?.value,
            effects_profile_id: document.getElementById('effectsProfileId')?.value,
            pitch: parseFloat(document.getElementById('pitch')?.value || '0'),
            speaking_rate: parseFloat(document.getElementById('speakingRate')?.value || '1.0'),
            volume_gain_db: parseFloat(document.getElementById('volumeGainDb')?.value || '0'),
            audio_format: document.getElementById('audioFormat')?.value
        }
    };
    fetch('/api/presets/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(data => {
            if (data && data.success) {
                showNotification('Preajuste guardado', 'success');
                if (modal) modal.style.display = 'none';
                loadPresets();
            } else {
                showNotification('Error al guardar preajuste', 'error');
            }
        })
        .catch(() => showNotification('Error al guardar preajuste', 'error'));
}

 

// Obtener opciones de voz para un idioma
function getVoiceOptionsForLanguage(language) {
    const voiceOptions = {
        'es-ES': [
            { value: 'es-ES-Standard-A', text: 'Femenina Normal' },
            { value: 'es-ES-Standard-B', text: 'Masculino Normal' },
            { value: 'es-ES-Standard-C', text: 'Femenina Normal 2' },
            { value: 'es-ES-Standard-D', text: 'Masculino Normal 2' },
            { value: 'es-ES-Neural2-A', text: 'Femenina Neural' },
            { value: 'es-ES-Neural2-B', text: 'Masculino Neural' },
            { value: 'es-ES-Neural2-C', text: 'Femenina Neural 2' },
            { value: 'es-ES-Neural2-D', text: 'Masculino Neural 2' },
            { value: 'es-ES-Wavenet-A', text: 'Femenina WaveNet' },
            { value: 'es-ES-Wavenet-B', text: 'Masculino WaveNet' },
            { value: 'es-ES-Wavenet-C', text: 'Femenina WaveNet 2' },
            { value: 'es-ES-Wavenet-D', text: 'Masculino WaveNet 2' }
        ],
        'es-MX': [],
        'en-US': [
            { value: 'en-US-Standard-A', text: 'Female Normal' },
            { value: 'en-US-Standard-B', text: 'Male Normal' },
            { value: 'en-US-Standard-C', text: 'Female Normal 2' },
            { value: 'en-US-Standard-D', text: 'Male Normal 2' },
            { value: 'en-US-Standard-E', text: 'Female Normal 3' },
            { value: 'en-US-Standard-F', text: 'Male Normal 3' },
            { value: 'en-US-Neural2-A', text: 'Female Neural' },
            { value: 'en-US-Neural2-B', text: 'Male Neural' },
            { value: 'en-US-Neural2-C', text: 'Female Neural 2' },
            { value: 'en-US-Neural2-D', text: 'Male Neural 2' },
            { value: 'en-US-Neural2-E', text: 'Female Neural 3' },
            { value: 'en-US-Neural2-F', text: 'Male Neural 3' },
            { value: 'en-US-Wavenet-A', text: 'Female WaveNet' },
            { value: 'en-US-Wavenet-B', text: 'Male WaveNet' },
            { value: 'en-US-Wavenet-C', text: 'Female WaveNet 2' },
            { value: 'en-US-Wavenet-D', text: 'Male WaveNet 2' },
            { value: 'en-US-Wavenet-E', text: 'Female WaveNet 3' },
            { value: 'en-US-Wavenet-F', text: 'Male WaveNet 3' }
        ],
        'en-GB': [
            { value: 'en-GB-Standard-A', text: 'Female Normal' },
            { value: 'en-GB-Standard-B', text: 'Male Normal' },
            { value: 'en-GB-Neural2-A', text: 'Female Neural' },
            { value: 'en-GB-Neural2-B', text: 'Male Neural' },
            { value: 'en-GB-Wavenet-A', text: 'Female WaveNet' },
            { value: 'en-GB-Wavenet-B', text: 'Male WaveNet' }
        ],
        'fr-FR': [
            { value: 'fr-FR-Standard-A', text: 'Féminine Normale' },
            { value: 'fr-FR-Standard-B', text: 'Masculin Normal' },
            { value: 'fr-FR-Standard-C', text: 'Féminine Normale 2' },
            { value: 'fr-FR-Standard-D', text: 'Masculin Normal 2' },
            { value: 'fr-FR-Neural2-A', text: 'Féminine Neural' },
            { value: 'fr-FR-Neural2-B', text: 'Masculin Neural' },
            { value: 'fr-FR-Neural2-C', text: 'Féminine Neural 2' },
            { value: 'fr-FR-Neural2-D', text: 'Masculin Neural 2' },
            { value: 'fr-FR-Wavenet-A', text: 'Féminine WaveNet' },
            { value: 'fr-FR-Wavenet-B', text: 'Masculin WaveNet' },
            { value: 'fr-FR-Wavenet-C', text: 'Féminine WaveNet 2' },
            { value: 'fr-FR-Wavenet-D', text: 'Masculin WaveNet 2' }
        ],
        'de-DE': [
            { value: 'de-DE-Standard-A', text: 'Weiblich Normal' },
            { value: 'de-DE-Standard-B', text: 'Männlich Normal' },
            { value: 'de-DE-Standard-C', text: 'Weiblich Normal 2' },
            { value: 'de-DE-Standard-D', text: 'Männlich Normal 2' },
            { value: 'de-DE-Neural2-A', text: 'Weiblich Neural' },
            { value: 'de-DE-Neural2-B', text: 'Männlich Neural' },
            { value: 'de-DE-Neural2-C', text: 'Weiblich Neural 2' },
            { value: 'de-DE-Neural2-D', text: 'Männlich Neural 2' },
            { value: 'de-DE-Wavenet-A', text: 'Weiblich WaveNet' },
            { value: 'de-DE-Wavenet-B', text: 'Männlich WaveNet' },
            { value: 'de-DE-Wavenet-C', text: 'Weiblich WaveNet 2' },
            { value: 'de-DE-Wavenet-D', text: 'Männlich WaveNet 2' }
        ],
        'it-IT': [
            { value: 'it-IT-Standard-A', text: 'Femminile Normale' },
            { value: 'it-IT-Standard-B', text: 'Maschile Normale' },
            { value: 'it-IT-Standard-C', text: 'Femminile Normale 2' },
            { value: 'it-IT-Standard-D', text: 'Maschile Normale 2' },
            { value: 'it-IT-Neural2-A', text: 'Femminile Neural' },
            { value: 'it-IT-Neural2-B', text: 'Maschile Neural' },
            { value: 'it-IT-Neural2-C', text: 'Femminile Neural 2' },
            { value: 'it-IT-Neural2-D', text: 'Maschile Neural 2' },
            { value: 'it-IT-Wavenet-A', text: 'Femminile WaveNet' },
            { value: 'it-IT-Wavenet-B', text: 'Maschile WaveNet' },
            { value: 'it-IT-Wavenet-C', text: 'Femminile WaveNet 2' },
            { value: 'it-IT-Wavenet-D', text: 'Maschile WaveNet 2' }
        ],
        'pt-BR': [
            { value: 'pt-BR-Standard-A', text: 'Feminina Normal' },
            { value: 'pt-BR-Standard-B', text: 'Masculino Normal' },
            { value: 'pt-BR-Neural2-A', text: 'Feminina Neural' },
            { value: 'pt-BR-Neural2-B', text: 'Masculino Neural' },
            { value: 'pt-BR-Wavenet-A', text: 'Feminina WaveNet' },
            { value: 'pt-BR-Wavenet-B', text: 'Masculino WaveNet' }
        ],
        'ja-JP': [
            { value: 'ja-JP-Standard-A', text: '女性 標準' },
            { value: 'ja-JP-Standard-B', text: '男性 標準' },
            { value: 'ja-JP-Wavenet-A', text: '女性 WaveNet' },
            { value: 'ja-JP-Wavenet-B', text: '男性 WaveNet' }
        ],
        'ko-KR': [
            { value: 'ko-KR-Standard-A', text: '여성 표준' },
            { value: 'ko-KR-Standard-B', text: '남성 표준' },
            { value: 'ko-KR-Wavenet-A', text: '여성 WaveNet' },
            { value: 'ko-KR-Wavenet-B', text: '남성 WaveNet' }
        ],
        'zh-CN': []
    };
    
    return voiceOptions[language] || [];
}

function getStaticVoiceOptions(language, gender) {
    const male = 'male', female = 'female';
    const voices = {
        'es-ES': {
            female: ['es-ES-Chirp-HD-F','es-ES-Chirp-HD-O','es-ES-Chirp3-HD-Aoede','es-ES-Chirp3-HD-Autonoe','es-ES-Chirp3-HD-Callirrhoe','es-ES-Chirp3-HD-Despina','es-ES-Chirp3-HD-Erinome','es-ES-Chirp3-HD-Gacrux','es-ES-Chirp3-HD-Kore','es-ES-Chirp3-HD-Laomedeia','es-ES-Chirp3-HD-Leda','es-ES-Chirp3-HD-Pulcherrima','es-ES-Chirp3-HD-Sulafat','es-ES-Chirp3-HD-Vindemiatrix','es-ES-Chirp3-HD-Zephyr','es-ES-Neural2-A','es-ES-Neural2-E','es-ES-Neural2-H','es-ES-Standard-F','es-ES-Standard-H','es-ES-Studio-C','es-ES-Wavenet-F','es-ES-Wavenet-H'],
            male: ['es-ES-Chirp-HD-D','es-ES-Chirp3-HD-Achird','es-ES-Chirp3-HD-Algenib','es-ES-Chirp3-HD-Algieba','es-ES-Chirp3-HD-Alnilam','es-ES-Chirp3-HD-Charon','es-ES-Chirp3-HD-Enceladus','es-ES-Chirp3-HD-Fenrir','es-ES-Chirp3-HD-Iapetus','es-ES-Chirp3-HD-Orus','es-ES-Chirp3-HD-Puck','es-ES-Chirp3-HD-Rasalgethi','es-ES-Chirp3-HD-Sadachbia','es-ES-Chirp3-HD-Sadaltager','es-ES-Chirp3-HD-Schedar','es-ES-Chirp3-HD-Umbriel','es-ES-Chirp3-HD-Zubenelgenubi','es-ES-Neural2-F','es-ES-Neural2-G','es-ES-Polyglot-1','es-ES-Standard-E','es-ES-Standard-G','es-ES-Studio-F','es-ES-Wavenet-E','es-ES-Wavenet-G']
        },
        'en-US': {
            female: ['Aoede','Autonoe','Callirrhoe','Despina','Erinome','Gacrux','Kore','Laomedeia','Leda','Pulcherrima','Sulafat','Vindemiatrix','Zephyr','en-US-Chirp-HD-F','en-US-Chirp-HD-O','en-US-Chirp3-HD-Achernar','en-US-Chirp3-HD-Aoede','en-US-Chirp3-HD-Autonoe','en-US-Chirp3-HD-Callirrhoe','en-US-Chirp3-HD-Despina','en-US-Chirp3-HD-Erinome','en-US-Chirp3-HD-Gacrux','en-US-Chirp3-HD-Kore','en-US-Chirp3-HD-Laomedeia','en-US-Chirp3-HD-Leda','en-US-Chirp3-HD-Pulcherrima','en-US-Chirp3-HD-Sulafat','en-US-Chirp3-HD-Vindemiatrix','en-US-Chirp3-HD-Zephyr','en-US-Neural2-C','en-US-Neural2-E','en-US-Neural2-F','en-US-Neural2-G','en-US-Neural2-H','en-US-News-L','en-US-Standard-C','en-US-Standard-E','en-US-Standard-F','en-US-Standard-G','en-US-Standard-H','en-US-Studio-O','en-US-Wavenet-C','en-US-Wavenet-E','en-US-Wavenet-F','en-US-Wavenet-G','en-US-Wavenet-H'],
            male: ['Achird','Algenib','Algieba','Alnilam','Charon','Enceladus','Fenrir','Iapetus','Orus','Puck','Rasalgethi','Sadachbia','Sadaltager','Schedar','Umbriel','Zubenelgenubi','en-US-Casual-K','en-US-Chirp-HD-D','en-US-Chirp3-HD-Achird','en-US-Chirp3-HD-Algenib','en-US-Chirp3-HD-Algieba','en-US-Chirp3-HD-Alnilam','en-US-Chirp3-HD-Charon','en-US-Chirp3-HD-Enceladus','en-US-Chirp3-HD-Fenrir','en-US-Chirp3-HD-Iapetus','en-US-Chirp3-HD-Orus','en-US-Chirp3-HD-Puck','en-US-Chirp3-HD-Rasalgethi','en-US-Chirp3-HD-Sadachbia','en-US-Chirp3-HD-Sadaltager','en-US-Chirp3-HD-Schedar','en-US-Chirp3-HD-Umbriel','en-US-Chirp3-HD-Zubenelgenubi','en-US-Neural2-A','en-US-Neural2-D','en-US-Neural2-I','en-US-Neural2-J','en-US-News-K','en-US-News-N','en-US-Polyglot-1','en-US-Standard-A','en-US-Standard-B','en-US-Standard-D','en-US-Standard-I','en-US-Standard-J','en-US-Studio-Q','en-US-Wavenet-A','en-US-Wavenet-B','en-US-Wavenet-D','en-US-Wavenet-I','en-US-Wavenet-J']
        },
        'en-GB': {
            female: ['en-GB-Chirp-HD-F','en-GB-Chirp-HD-O','en-GB-Chirp3-HD-Aoede','en-GB-Chirp3-HD-Autonoe','en-GB-Chirp3-HD-Callirrhoe','en-GB-Chirp3-HD-Despina','en-GB-Chirp3-HD-Erinome','en-GB-Chirp3-HD-Gacrux','en-GB-Chirp3-HD-Kore','en-GB-Chirp3-HD-Laomedeia','en-GB-Chirp3-HD-Leda','en-GB-Chirp3-HD-Pulcherrima','en-GB-Chirp3-HD-Sulafat','en-GB-Chirp3-HD-Vindemiatrix','en-GB-Chirp3-HD-Zephyr','en-GB-Neural2-A','en-GB-Neural2-C','en-GB-Neural2-F','en-GB-Neural2-N','en-GB-News-G','en-GB-News-H','en-GB-News-I','en-GB-Standard-A','en-GB-Standard-C','en-GB-Standard-F','en-GB-Standard-N','en-GB-Studio-C','en-GB-Wavenet-A','en-GB-Wavenet-C','en-GB-Wavenet-F','en-GB-Wavenet-N'],
            male: ['en-GB-Chirp-HD-D','en-GB-Chirp3-HD-Achird','en-GB-Chirp3-HD-Algenib','en-GB-Chirp3-HD-Algieba','en-GB-Chirp3-HD-Alnilam','en-GB-Chirp3-HD-Charon','en-GB-Chirp3-HD-Enceladus','en-GB-Chirp3-HD-Fenrir','en-GB-Chirp3-HD-Iapetus','en-GB-Chirp3-HD-Orus','en-GB-Chirp3-HD-Puck','en-GB-Chirp3-HD-Rasalgethi','en-GB-Chirp3-HD-Sadachbia','en-GB-Chirp3-HD-Sadaltager','en-GB-Chirp3-HD-Schedar','en-GB-Chirp3-HD-Umbriel','en-GB-Chirp3-HD-Zubenelgenubi','en-GB-Neural2-B','en-GB-Neural2-D','en-GB-Neural2-O','en-GB-News-J','en-GB-News-K','en-GB-News-L','en-GB-News-M','en-GB-Standard-B','en-GB-Standard-D','en-GB-Standard-O','en-GB-Studio-B','en-GB-Wavenet-B','en-GB-Wavenet-D','en-GB-Wavenet-O']
        },
        'fr-FR': {
            female: ['fr-FR-Chirp-HD-F','fr-FR-Chirp-HD-O','fr-FR-Chirp3-HD-Aoede','fr-FR-Chirp3-HD-Autonoe','fr-FR-Chirp3-HD-Callirrhoe','fr-FR-Chirp3-HD-Despina','fr-FR-Chirp3-HD-Erinome','fr-FR-Chirp3-HD-Gacrux','fr-FR-Chirp3-HD-Kore','fr-FR-Chirp3-HD-Laomedeia','fr-FR-Chirp3-HD-Leda','fr-FR-Chirp3-HD-Pulcherrima','fr-FR-Chirp3-HD-Sulafat','fr-FR-Chirp3-HD-Vindemiatrix','fr-FR-Chirp3-HD-Zephyr','fr-FR-Neural2-F','fr-FR-Standard-F','fr-FR-Studio-A','fr-FR-Wavenet-F'],
            male: ['fr-FR-Chirp-HD-D','fr-FR-Chirp3-HD-Achird','fr-FR-Chirp3-HD-Algenib','fr-FR-Chirp3-HD-Algieba','fr-FR-Chirp3-HD-Alnilam','fr-FR-Chirp3-HD-Charon','fr-FR-Chirp3-HD-Enceladus','fr-FR-Chirp3-HD-Fenrir','fr-FR-Chirp3-HD-Iapetus','fr-FR-Chirp3-HD-Orus','fr-FR-Chirp3-HD-Puck','fr-FR-Chirp3-HD-Rasalgethi','fr-FR-Chirp3-HD-Sadachbia','fr-FR-Chirp3-HD-Sadaltager','fr-FR-Chirp3-HD-Schedar','fr-FR-Chirp3-HD-Umbriel','fr-FR-Chirp3-HD-Zubenelgenubi','fr-FR-Neural2-G','fr-FR-Polyglot-1','fr-FR-Standard-G','fr-FR-Studio-D','fr-FR-Wavenet-G']
        },
        'de-DE': {
            female: ['de-DE-Chirp-HD-F','de-DE-Chirp-HD-O','de-DE-Chirp3-HD-Aoede','de-DE-Chirp3-HD-Autonoe','de-DE-Chirp3-HD-Callirrhoe','de-DE-Chirp3-HD-Despina','de-DE-Chirp3-HD-Erinome','de-DE-Chirp3-HD-Gacrux','de-DE-Chirp3-HD-Kore','de-DE-Chirp3-HD-Laomedeia','de-DE-Chirp3-HD-Leda','de-DE-Chirp3-HD-Pulcherrima','de-DE-Chirp3-HD-Sulafat','de-DE-Chirp3-HD-Vindemiatrix','de-DE-Chirp3-HD-Zephyr','de-DE-Neural2-G','de-DE-Standard-G','de-DE-Studio-C','de-DE-Wavenet-G'],
            male: ['de-DE-Chirp-HD-D','de-DE-Chirp3-HD-Achird','de-DE-Chirp3-HD-Algenib','de-DE-Chirp3-HD-Algieba','de-DE-Chirp3-HD-Alnilam','de-DE-Chirp3-HD-Charon','de-DE-Chirp3-HD-Enceladus','de-DE-Chirp3-HD-Fenrir','de-DE-Chirp3-HD-Iapetus','de-DE-Chirp3-HD-Orus','de-DE-Chirp3-HD-Puck','de-DE-Chirp3-HD-Rasalgethi','de-DE-Chirp3-HD-Sadachbia','de-DE-Chirp3-HD-Sadaltager','de-DE-Chirp3-HD-Schedar','de-DE-Chirp3-HD-Umbriel','de-DE-Chirp3-HD-Zubenelgenubi','de-DE-Neural2-H','de-DE-Polyglot-1','de-DE-Standard-H','de-DE-Studio-B','de-DE-Wavenet-H']
        },
        'it-IT': {
            female: ['it-IT-Chirp-HD-F','it-IT-Chirp-HD-O','it-IT-Chirp3-HD-Aoede','it-IT-Chirp3-HD-Autonoe','it-IT-Chirp3-HD-Callirrhoe','it-IT-Chirp3-HD-Despina','it-IT-Chirp3-HD-Erinome','it-IT-Chirp3-HD-Gacrux','it-IT-Chirp3-HD-Kore','it-IT-Chirp3-HD-Laomedeia','it-IT-Chirp3-HD-Leda','it-IT-Chirp3-HD-Pulcherrima','it-IT-Chirp3-HD-Sulafat','it-IT-Chirp3-HD-Vindemiatrix','it-IT-Chirp3-HD-Zephyr','it-IT-Neural2-A','it-IT-Neural2-E','it-IT-Standard-E','it-IT-Wavenet-E'],
            male: ['it-IT-Chirp-HD-D','it-IT-Chirp3-HD-Achird','it-IT-Chirp3-HD-Algenib','it-IT-Chirp3-HD-Algieba','it-IT-Chirp3-HD-Alnilam','it-IT-Chirp3-HD-Charon','it-IT-Chirp3-HD-Enceladus','it-IT-Chirp3-HD-Fenrir','it-IT-Chirp3-HD-Iapetus','it-IT-Chirp3-HD-Orus','it-IT-Chirp3-HD-Puck','it-IT-Chirp3-HD-Rasalgethi','it-IT-Chirp3-HD-Sadachbia','it-IT-Chirp3-HD-Sadaltager','it-IT-Chirp3-HD-Schedar','it-IT-Chirp3-HD-Umbriel','it-IT-Chirp3-HD-Zubenelgenubi','it-IT-Neural2-F','it-IT-Standard-F','it-IT-Wavenet-F']
        },
        'pt-BR': {
            female: ['pt-BR-Chirp3-HD-Aoede','pt-BR-Chirp3-HD-Autonoe','pt-BR-Chirp3-HD-Callirrhoe','pt-BR-Chirp3-HD-Despina','pt-BR-Chirp3-HD-Erinome','pt-BR-Chirp3-HD-Gacrux','pt-BR-Chirp3-HD-Kore','pt-BR-Chirp3-HD-Laomedeia','pt-BR-Chirp3-HD-Leda','pt-BR-Chirp3-HD-Pulcherrima','pt-BR-Chirp3-HD-Sulafat','pt-BR-Chirp3-HD-Vindemiatrix','pt-BR-Chirp3-HD-Zephyr','pt-BR-Neural2-A','pt-BR-Neural2-C','pt-BR-Standard-A','pt-BR-Standard-C','pt-BR-Wavenet-A','pt-BR-Wavenet-C','pt-BR-Wavenet-D'],
            male: ['pt-BR-Chirp3-HD-Achernar','pt-BR-Chirp3-HD-Achird','pt-BR-Chirp3-HD-Algenib','pt-BR-Chirp3-HD-Algieba','pt-BR-Chirp3-HD-Alnilam','pt-BR-Chirp3-HD-Charon','pt-BR-Chirp3-HD-Enceladus','pt-BR-Chirp3-HD-Fenrir','pt-BR-Chirp3-HD-Iapetus','pt-BR-Chirp3-HD-Orus','pt-BR-Chirp3-HD-Puck','pt-BR-Chirp3-HD-Rasalgethi','pt-BR-Chirp3-HD-Sadachbia','pt-BR-Chirp3-HD-Sadaltager','pt-BR-Chirp3-HD-Schedar','pt-BR-Chirp3-HD-Umbriel','pt-BR-Chirp3-HD-Zubenelgenubi','pt-BR-Neural2-B','pt-BR-Standard-B','pt-BR-Standard-D','pt-BR-Standard-E','pt-BR-Wavenet-B','pt-BR-Wavenet-E']
        },
        'ja-JP': {
            female: ['ja-JP-Chirp3-HD-Aoede','ja-JP-Chirp3-HD-Autonoe','ja-JP-Chirp3-HD-Callirrhoe','ja-JP-Chirp3-HD-Despina','ja-JP-Chirp3-HD-Erinome','ja-JP-Chirp3-HD-Gacrux','ja-JP-Chirp3-HD-Kore','ja-JP-Chirp3-HD-Laomedeia','ja-JP-Chirp3-HD-Leda','ja-JP-Chirp3-HD-Pulcherrima','ja-JP-Chirp3-HD-Sulafat','ja-JP-Chirp3-HD-Vindemiatrix','ja-JP-Chirp3-HD-Zephyr','ja-JP-Neural2-B','ja-JP-Standard-A','ja-JP-Standard-B','ja-JP-Wavenet-A','ja-JP-Wavenet-B'],
            male: ['ja-JP-Chirp3-HD-Achernar','ja-JP-Chirp3-HD-Achird','ja-JP-Chirp3-HD-Algenib','ja-JP-Chirp3-HD-Algieba','ja-JP-Chirp3-HD-Alnilam','ja-JP-Chirp3-HD-Charon','ja-JP-Chirp3-HD-Enceladus','ja-JP-Chirp3-HD-Fenrir','ja-JP-Chirp3-HD-Iapetus','ja-JP-Chirp3-HD-Orus','ja-JP-Chirp3-HD-Puck','ja-JP-Chirp3-HD-Rasalgethi','ja-JP-Chirp3-HD-Sadachbia','ja-JP-Chirp3-HD-Sadaltager','ja-JP-Chirp3-HD-Schedar','ja-JP-Chirp3-HD-Umbriel','ja-JP-Chirp3-HD-Zubenelgenubi','ja-JP-Neural2-C','ja-JP-Neural2-D','ja-JP-Standard-C','ja-JP-Standard-D','ja-JP-Wavenet-C','ja-JP-Wavenet-D']
        },
        'ko-KR': {
            female: ['ko-KR-Chirp3-HD-Aoede','ko-KR-Chirp3-HD-Autonoe','ko-KR-Chirp3-HD-Callirrhoe','ko-KR-Chirp3-HD-Despina','ko-KR-Chirp3-HD-Erinome','ko-KR-Chirp3-HD-Gacrux','ko-KR-Chirp3-HD-Kore','ko-KR-Chirp3-HD-Laomedeia','ko-KR-Chirp3-HD-Leda','ko-KR-Chirp3-HD-Pulcherrima','ko-KR-Chirp3-HD-Sulafat','ko-KR-Chirp3-HD-Vindemiatrix','ko-KR-Chirp3-HD-Zephyr','ko-KR-Neural2-A','ko-KR-Neural2-B','ko-KR-Standard-A','ko-KR-Standard-B','ko-KR-Wavenet-A','ko-KR-Wavenet-B'],
            male: ['ko-KR-Chirp3-HD-Achernar','ko-KR-Chirp3-HD-Achird','ko-KR-Chirp3-HD-Algenib','ko-KR-Chirp3-HD-Algieba','ko-KR-Chirp3-HD-Alnilam','ko-KR-Chirp3-HD-Charon','ko-KR-Chirp3-HD-Enceladus','ko-KR-Chirp3-HD-Fenrir','ko-KR-Chirp3-HD-Iapetus','ko-KR-Chirp3-HD-Orus','ko-KR-Chirp3-HD-Puck','ko-KR-Chirp3-HD-Rasalgethi','ko-KR-Chirp3-HD-Sadachbia','ko-KR-Chirp3-HD-Sadaltager','ko-KR-Chirp3-HD-Schedar','ko-KR-Chirp3-HD-Umbriel','ko-KR-Chirp3-HD-Zubenelgenubi','ko-KR-Neural2-C','ko-KR-Standard-C','ko-KR-Standard-D','ko-KR-Wavenet-C','ko-KR-Wavenet-D']
        }
    };
    const byLang = voices[language];
    if (!byLang) return [];
    const list = (gender === female ? byLang.female : byLang.male) || [];
    return list.map(n => ({ value: n, text: n }));
}

// Funciones de tema
function resetThemeDetection() {
    localStorage.removeItem('userChangedTheme');
    localStorage.removeItem('theme');
    
    // Aplicar tema del sistema
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    applyTheme(systemTheme);
    
    showNotification('Detección automática de tema restaurada', 'info');
}

function forceAutoTheme() {
    localStorage.clear();
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    applyTheme(systemTheme);
    showNotification('Tema automático aplicado', 'info');
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

function clearAllThemeSettings() {
    localStorage.clear();
    window.location.reload();
}

// Funciones de video
function handleVideoSelect(event, videoNumber) {
    const file = event.target.files[0];
    if (file) {
        const fileInfo = document.getElementById(`video${videoNumber}Info`);
        const fileName = fileInfo.querySelector('.file-name');
        const fileSize = fileInfo.querySelector('.file-size');
        
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileInfo.style.display = 'block';
        
        // Agregar clase para indicar que tiene archivo
        const uploadLabel = fileInfo.closest('.file-upload-label');
        if (uploadLabel) {
            uploadLabel.classList.add('has-file');
        }
        
        console.log(`🎬 Video ${videoNumber} seleccionado: ${file.name} (${formatFileSize(file.size)})`);
    }
}

function clearVideoSelection() {
    // Limpiar todos los inputs de video
    for (let i = 1; i <= 4; i++) {
        const videoInput = document.getElementById(`video${i}`);
        const fileInfo = document.getElementById(`video${i}Info`);
        
        if (videoInput) videoInput.value = '';
        if (fileInfo) fileInfo.style.display = 'none';
        
        // Remover clase has-file
        const uploadLabel = fileInfo?.closest('.file-upload-label');
        if (uploadLabel) {
            uploadLabel.classList.remove('has-file');
        }
    }
    
    // Ocultar resultados
    const resultsSection = document.getElementById('mergeResultsSection');
    if (resultsSection) {
        resultsSection.style.display = 'none';
    }
    
    showNotification('Selección de videos limpiada', 'info');
}

// Funciones de loop de video
function handleLoopVideoSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const fileInfo = document.getElementById('loopVideoFileInfo');
        const fileName = fileInfo.querySelector('.file-name');
        const fileSize = fileInfo.querySelector('.file-size');
        
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileInfo.style.display = 'block';
        
        // Agregar clase para indicar que tiene archivo
        const uploadLabel = fileInfo.closest('.file-upload-label');
        if (uploadLabel) {
            uploadLabel.classList.add('has-file');
        }
        
        // Mostrar vista previa del loop
        updateLoopPreview(file);
        
        console.log(`🎬 Video seleccionado para loop: ${file.name} (${formatFileSize(file.size)})`);
    }
}

function updateLoopPreview(file) {
    // Crear un video temporal para obtener la duración
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = function() {
        const originalDuration = video.duration;
        const targetMinutes = parseInt(document.getElementById('targetMinutes').value) || 0;
        const targetSeconds = parseInt(document.getElementById('targetSeconds').value) || 0;
        const targetDuration = targetMinutes * 60 + targetSeconds;
        
        const loopsNeeded = Math.ceil(targetDuration / originalDuration);
        const finalDuration = loopsNeeded * originalDuration;
        
        // Actualizar vista previa
        document.getElementById('originalDuration').textContent = formatDuration(originalDuration);
        document.getElementById('targetDurationDisplay').textContent = formatDuration(targetDuration);
        document.getElementById('loopsNeeded').textContent = loopsNeeded;
        document.getElementById('finalDuration').textContent = formatDuration(finalDuration);
        
        // Mostrar vista previa
        document.getElementById('loopPreview').style.display = 'block';
        
        // Limpiar video temporal
        video.remove();
    };
    
    video.src = URL.createObjectURL(file);
}

function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function updateLoopPreviewOnChange() {
    const fileInput = document.getElementById('loopVideoFile');
    if (fileInput.files.length > 0) {
        updateLoopPreview(fileInput.files[0]);
    }
}

function formatSecondsInput() {
    const secondsInput = document.getElementById('targetSeconds');
    if (secondsInput) {
        let value = parseInt(secondsInput.value) || 0;
        if (value < 0) value = 0;
        if (value > 59) value = 59;
        secondsInput.value = value.toString().padStart(2, '0');
    }
}

function clearLoopForm() {
    // Limpiar formulario
    document.getElementById('loopVideoForm').reset();
    
    // Restablecer valores por defecto
    const targetMinutes = document.getElementById('targetMinutes');
    const targetSeconds = document.getElementById('targetSeconds');
    if (targetMinutes) targetMinutes.value = '1';
    if (targetSeconds) targetSeconds.value = '00';
    
    // Ocultar elementos
    document.getElementById('loopVideoFileInfo').style.display = 'none';
    document.getElementById('loopPreview').style.display = 'none';
    document.getElementById('loopResultsSection').style.display = 'none';
    document.getElementById('loopProgressSection').style.display = 'none';
    
    // Remover clase has-file
    const uploadLabel = document.querySelector('#loopVideoFileInfo').closest('.file-upload-label');
    if (uploadLabel) {
        uploadLabel.classList.remove('has-file');
    }
    
    // Limpiar variables
    currentLoopVideoUrl = null;
    
    showNotification('Formulario limpiado', 'info');
}

// Funciones de gestión de pestañas
function loadDynamicTabs() {
    const savedTabs = localStorage.getItem('dynamicTabs');
    if (savedTabs) {
        try {
            const tabs = JSON.parse(savedTabs);
            tabs.forEach(tab => {
                createDynamicTab(tab.name, tab.template, tab.id);
            });
        } catch (error) {
            console.error('Error cargando pestañas:', error);
        }
    }
    
    // Actualizar lista de pestañas
    updateTabsList();
}

function createDynamicTab(name, template, id) {
    const tabsContainer = document.querySelector('.tabs-container');
    const tabButton = document.createElement('button');
    tabButton.className = 'tab';
    tabButton.setAttribute('data-tab', id);
    tabButton.innerHTML = `<span class="tab-icon">📄</span><span class="tab-text">${name}</span>`;
    
    // Agregar botón de cerrar
    const closeBtn = document.createElement('span');
    closeBtn.className = 'tab-close';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = (e) => {
        e.stopPropagation();
        removeDynamicTab(id);
    };
    tabButton.appendChild(closeBtn);
    
    tabsContainer.appendChild(tabButton);
    
    // Crear contenido de la pestaña
    const tabContent = document.createElement('div');
    tabContent.className = 'tab-content';
    tabContent.id = id;
    tabContent.innerHTML = getTemplateContent(template);
    
    document.querySelector('.main-content').appendChild(tabContent);
    
    // Inicializar funciones específicas del template
    initializeTemplateFunctions(template, id);
    
    // Actualizar lista de pestañas
    updateTabsList();
}

function addNewTab() {
    const tabName = prompt('Nombre de la nueva pestaña:');
    if (tabName) {
        const tabId = 'tab_' + Date.now();
        createDynamicTab(tabName, 'blank', tabId);
        
        // Guardar en localStorage
        const savedTabs = JSON.parse(localStorage.getItem('dynamicTabs') || '[]');
        savedTabs.push({ name: tabName, template: 'blank', id: tabId });
        localStorage.setItem('dynamicTabs', JSON.stringify(savedTabs));
        
        showNotification('Nueva pestaña creada', 'success');
    }
}

function removeDynamicTab(tabId) {
    // Remover botón de pestaña
    const tabButton = document.querySelector(`[data-tab="${tabId}"]`);
    if (tabButton) {
        tabButton.remove();
    }
    
    // Remover contenido de pestaña
    const tabContent = document.getElementById(tabId);
    if (tabContent) {
        tabContent.remove();
    }
    
    // Actualizar localStorage
    const savedTabs = JSON.parse(localStorage.getItem('dynamicTabs') || '[]');
    const updatedTabs = savedTabs.filter(tab => tab.id !== tabId);
    localStorage.setItem('dynamicTabs', JSON.stringify(updatedTabs));
    
    // Actualizar lista de pestañas
    updateTabsList();
    
    showNotification('Pestaña eliminada', 'info');
}

function showTabTemplates() {
    const templates = [
        { name: 'Calculadora', template: 'calculator' },
        { name: 'Lista de Tareas', template: 'todo' },
        { name: 'Notas', template: 'notes' }
    ];
    
    let templateList = 'Plantillas disponibles:\n\n';
    templates.forEach((template, index) => {
        templateList += `${index + 1}. ${template.name}\n`;
    });
    
    const choice = prompt(templateList + '\nIngresa el número de la plantilla:');
    const selectedTemplate = templates[parseInt(choice) - 1];
    
    if (selectedTemplate) {
        const tabName = prompt('Nombre de la pestaña:');
        if (tabName) {
            const tabId = 'tab_' + Date.now();
            createDynamicTab(tabName, selectedTemplate.template, tabId);
            
            // Guardar en localStorage
            const savedTabs = JSON.parse(localStorage.getItem('dynamicTabs') || '[]');
            savedTabs.push({ name: tabName, template: selectedTemplate.template, id: tabId });
            localStorage.setItem('dynamicTabs', JSON.stringify(savedTabs));
            
            showNotification('Pestaña creada con plantilla', 'success');
        }
    }
}

function getTemplateContent(template) {
    const templates = {
        'blank': '<div class="card"><div class="card-header"><h2>📄 Nueva Pestaña</h2></div><div class="card-body"><p>Contenido de la pestaña personalizada.</p></div></div>',
        'calculator': '<div class="card"><div class="card-header"><h2>🧮 Calculadora</h2></div><div class="card-body"><div class="calculator"><input type="text" id="calcDisplay" readonly><div class="calc-buttons"><button onclick="calcInput(\'7\')">7</button><button onclick="calcInput(\'8\')">8</button><button onclick="calcInput(\'9\')">9</button><button onclick="calcInput(\'/\')">/</button><button onclick="calcInput(\'4\')">4</button><button onclick="calcInput(\'5\')">5</button><button onclick="calcInput(\'6\')">6</button><button onclick="calcInput(\'*\')">*</button><button onclick="calcInput(\'1\')">1</button><button onclick="calcInput(\'2\')">2</button><button onclick="calcInput(\'3\')">3</button><button onclick="calcInput(\'-\')">-</button><button onclick="calcInput(\'0\')">0</button><button onclick="calcInput(\'.\')">.</button><button onclick="calcEquals()">=</button><button onclick="calcInput(\'+\')">+</button></div></div></div></div>',
        'todo': '<div class="card"><div class="card-header"><h2>✅ Lista de Tareas</h2></div><div class="card-body"><div class="todo-container"><input type="text" id="todoInput" placeholder="Nueva tarea..."><button onclick="addTodo()">Agregar</button><ul id="todoList"></ul></div></div></div>',
        'notes': '<div class="card"><div class="card-header"><h2>📝 Notas</h2></div><div class="card-body"><textarea id="notesText" placeholder="Escribe tus notas aquí..." style="width: 100%; height: 300px;"></textarea></div></div>'
    };
    
    return templates[template] || templates['blank'];
}

function initializeTemplateFunctions(template, tabId) {
    // Inicializar funciones específicas según el template
    if (template === 'calculator') {
        // Resetear calculadora
        const calcDisplay = document.querySelector(`#${tabId} #calcDisplay`);
        if (calcDisplay) {
            calcDisplay.value = '';
        }
    } else if (template === 'todo') {
        // Renderizar lista de tareas
        renderTodos(tabId);
    }
}

function updateTabsList() {
    const tabsList = document.getElementById('tabsList');
    if (!tabsList) return;
    
    const savedTabs = localStorage.getItem('dynamicTabs');
    if (savedTabs) {
        try {
            const tabs = JSON.parse(savedTabs);
            tabsList.innerHTML = tabs.map(tab => 
                `<div class="tab-item">
                    <span class="tab-name">${tab.name}</span>
                    <button onclick="removeDynamicTab('${tab.id}')" class="tab-remove">×</button>
                </div>`
            ).join('');
        } catch (error) {
            console.error('Error actualizando lista de pestañas:', error);
        }
    } else {
        tabsList.innerHTML = '<p>No hay pestañas dinámicas</p>';
    }
}

// Funciones de calculadora
function calcInput(value) {
    const display = document.querySelector('.tab-content.active #calcDisplay') || document.getElementById('calcDisplay');
    if (display) {
        display.value += value;
    }
}

function calcEquals() {
    const display = document.querySelector('.tab-content.active #calcDisplay') || document.getElementById('calcDisplay');
    if (display) {
        try {
            display.value = eval(display.value);
        } catch (error) {
            display.value = 'Error';
        }
    }
}

// Funciones de lista de tareas
function addTodo() {
    const activeTab = document.querySelector('.tab-content.active');
    if (!activeTab) return;
    
    const input = activeTab.querySelector('#todoInput');
    const tabId = activeTab.id;
    
    if (input && input.value.trim()) {
        // Obtener tareas existentes
        const savedTodos = localStorage.getItem(`todos_${tabId}`) || '[]';
        const todos = JSON.parse(savedTodos);
        
        // Agregar nueva tarea
        const newTodo = {
            id: Date.now(),
            text: input.value.trim(),
            completed: false
        };
        todos.push(newTodo);
        
        // Guardar en localStorage
        localStorage.setItem(`todos_${tabId}`, JSON.stringify(todos));
        
        // Limpiar input
        input.value = '';
        
        // Renderizar lista
        renderTodos(tabId);
    }
}

function renderTodos(tabId) {
    const todoList = document.querySelector(`#${tabId} #todoList`);
    if (!todoList) return;
    
    // Obtener tareas guardadas
    const savedTodos = localStorage.getItem(`todos_${tabId}`) || '[]';
    const todos = JSON.parse(savedTodos);
    
    // Renderizar tareas
    todoList.innerHTML = todos.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}">
            <span class="todo-text" onclick="toggleTodo('${tabId}', ${todo.id})">${todo.text}</span>
            <button class="todo-delete" onclick="deleteTodo('${tabId}', ${todo.id})">×</button>
        </li>
    `).join('');
}

function toggleTodo(tabId, todoId) {
    const savedTodos = localStorage.getItem(`todos_${tabId}`) || '[]';
    const todos = JSON.parse(savedTodos);
    
    const todo = todos.find(t => t.id === todoId);
    if (todo) {
        todo.completed = !todo.completed;
        localStorage.setItem(`todos_${tabId}`, JSON.stringify(todos));
        renderTodos(tabId);
    }
}

function deleteTodo(tabId, todoId) {
    const savedTodos = localStorage.getItem(`todos_${tabId}`) || '[]';
    const todos = JSON.parse(savedTodos);
    
    const updatedTodos = todos.filter(t => t.id !== todoId);
    localStorage.setItem(`todos_${tabId}`, JSON.stringify(updatedTodos));
    renderTodos(tabId);
}

// Funciones de configuración
async function saveServerConfig(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const config = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch('/api/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Configuración guardada exitosamente', 'success');
        } else {
            throw new Error(result.error || 'Error guardando configuración');
        }
        
    } catch (error) {
        showNotification(`Error: ${error.message}`, 'error');
        console.error('Error guardando configuración:', error);
    }
}

async function fetchGcsUsage() {
    try {
        const el = document.getElementById('gcsUsageText');
        if (!el) return;
        const response = await fetch('/api/gcs-usage');
        const result = await response.json();
        if (result.success) {
            el.textContent = `Espacio usado: ${result.formatted_size} (${result.count} objetos)`;
        }
    } catch (error) {
        console.error('Error obteniendo uso del bucket:', error);
    }
}

async function clearGcsBucket() {
    try {
        const proceed = confirm('¿Seguro que quieres vaciar el bucket de Google Cloud?');
        if (!proceed) return;
        const response = await fetch('/api/clear-gcs', { method: 'POST' });
        const result = await response.json();
        if (result.success) {
            showNotification(`Bucket vaciado: ${result.deleted} objetos, ${result.freed_size} liberados`, 'success');
            fetchGcsUsage();
        } else {
            throw new Error(result.error || 'Error desconocido');
        }
    } catch (error) {
        showNotification(`Error: ${error.message}`, 'error');
        console.error('Error vaciando bucket:', error);
    }
}

async function viewGcsBucket() {
    try {
        const response = await fetch('/api/gcs-list');
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Error desconocido');
        }
        const listEl = document.getElementById('gcsBucketList');
        const section = document.getElementById('gcsBucketResults');
        if (!listEl || !section) return;
        const items = result.items || [];
        const lines = items.map(i => `${i.name} — ${formatFileSize(i.size)}${i.updated ? ` — ${i.updated}` : ''}`);
        listEl.textContent = lines.length ? lines.join('\n') : 'Bucket vacío';
        section.style.display = 'block';
        showNotification(`Contenido cargado (${items.length} objetos)`, 'info');
    } catch (error) {
        showNotification(`Error: ${error.message}`, 'error');
        console.error('Error listando bucket:', error);
    }
}

// Procesar unión de videos
async function processVideoMerge(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Recopilar archivos de video
    const videoFiles = [];
    for (let i = 1; i <= 4; i++) {
        const videoInput = document.getElementById(`video${i}`);
        if (videoInput && videoInput.files[0]) {
            videoFiles.push(videoInput.files[0]);
        }
    }
    
    if (videoFiles.length === 0) {
        showNotification('Selecciona al menos un video', 'error');
        return;
    }
    
    // Agregar archivos al FormData
    videoFiles.forEach((file, index) => {
        formData.append(`video${index + 1}`, file);
    });
    
    // Mostrar progreso
    const progressSection = document.getElementById('mergeProgressSection');
    const progressFill = document.getElementById('mergeProgressFill');
    const progressText = document.getElementById('mergeProgressText');
    const processingInfo = document.getElementById('mergeProcessingInfo');
    const processingMode = document.getElementById('mergeProcessingModeText');
    const processingTime = document.getElementById('mergeProcessingTimeText');
    
    progressSection.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = 'Procesando videos...';
    processingInfo.style.display = 'none';
    
    // Obtener modo de procesamiento seleccionado
    const selectedMode = document.getElementById('processingMode').value;
    const modeText = selectedMode === 'auto' ? 'Automático' : 
                    selectedMode === 'gpu' ? 'GPU (RTX 3060/4070)' : 'CPU';
    
    
    processingMode.textContent = modeText;
    
    let progressInterval;
    const startTime = Date.now();
    
    try {
        // Simular progreso
        let progress = 0;
        progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            progressFill.style.width = `${progress}%`;
        }, 500);
        
        const response = await fetch('/api/merge-videos', {
            method: 'POST',
            body: formData
        });
        
        clearInterval(progressInterval);
        progressFill.style.width = '100%';
        progressText.textContent = 'Completado!';
        
        const result = await response.json();
        
        if (result.success) {
            // Calcular tiempo de procesamiento
            const endTime = Date.now();
            const processingDuration = ((endTime - startTime) / 1000).toFixed(2);
            
            // Mostrar información de procesamiento
            processingTime.textContent = `${processingDuration}s`;
            processingInfo.style.display = 'flex';
            
            
            // Ocultar progreso
            setTimeout(() => {
                progressSection.style.display = 'none';
            }, 3000); // Mostrar por 3 segundos para ver el tiempo
            
            // Mostrar resultados con información de procesamiento
            showMergeResults(result, processingDuration, modeText);
            showNotification(`Videos unidos exitosamente en ${processingDuration}s`, 'success');
        } else {
            throw new Error(result.error || 'Error desconocido');
        }
        
    } catch (error) {
        if (progressInterval) {
            clearInterval(progressInterval);
        }
        progressSection.style.display = 'none';
        showNotification(`Error: ${error.message}`, 'error');
        console.error('Error uniendo videos:', error);
    }
}

// Mostrar resultados de unión de videos
function showMergeResults(result, processingTime = null, processingMode = null) {
    const resultsSection = document.getElementById('mergeResultsSection');
    const videoPlayer = document.getElementById('mergedVideoPlayer');
    const videoDetails = document.getElementById('mergedVideoDetails');
    
    // Guardar URL del video
    currentMergedVideoUrl = result.video_url;
    
    // Mostrar reproductor de video
    videoPlayer.innerHTML = `
        <video controls style="width: 100%; max-width: 600px; border-radius: 8px;">
            <source src="${result.video_url}" type="video/mp4">
            Tu navegador no soporta el elemento video.
        </video>
    `;
    
    // Mostrar detalles
    const details = result.video_details;
    let detailsHTML = `
        <div class="detail-item">
            <span class="detail-label">Duración</span>
            <span class="detail-value">${details.duration}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Tamaño</span>
            <span class="detail-value">${details.size}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Resolución</span>
            <span class="detail-value">${details.resolution}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Formato</span>
            <span class="detail-value">${details.format}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Calidad</span>
            <span class="detail-value">${details.quality}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Videos Unidos</span>
            <span class="detail-value">${details.videos_merged}</span>
        </div>`;
    
    // Agregar información de procesamiento si está disponible
    if (processingTime && processingMode) {
        detailsHTML += `
        <div class="detail-item">
            <span class="detail-label">Modo de Procesamiento</span>
            <span class="detail-value">${processingMode}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Tiempo de Procesamiento</span>
            <span class="detail-value">${processingTime}s</span>
        </div>`;
    }
    
    videoDetails.innerHTML = detailsHTML;
    resultsSection.style.display = 'block';
}

// Descargar video unido
function downloadMergedVideo() {
    if (currentMergedVideoUrl) {
        const link = document.createElement('a');
        link.href = currentMergedVideoUrl;
        link.download = 'video_unido.mp4';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        showNotification('No hay video para descargar', 'error');
    }
}

// Crear loop de video
async function createVideoLoop(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Validar duración
    const targetMinutes = parseInt(formData.get('target_minutes')) || 0;
    const targetSeconds = parseInt(formData.get('target_seconds')) || 0;
    const targetDuration = targetMinutes * 60 + targetSeconds;
    
    if (targetDuration <= 0) {
        showNotification('Por favor, especifica una duración válida', 'error');
        return;
    }
    
    // Mostrar progreso
    const progressSection = document.getElementById('loopProgressSection');
    const progressFill = document.getElementById('loopProgressFill');
    const progressText = document.getElementById('loopProgressText');
    const processingInfo = document.getElementById('loopProcessingInfo');
    const processingMode = document.getElementById('loopProcessingModeText');
    const processingTime = document.getElementById('loopProcessingTimeText');
    
    progressSection.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = 'Preparando video...';
    processingInfo.style.display = 'none';
    
    // Obtener modo de procesamiento seleccionado
    const selectedMode = document.getElementById('loopProcessingMode').value;
    const modeText = selectedMode === 'auto' ? 'Automático' : 
                    selectedMode === 'gpu' ? 'GPU (RTX 3060/4070)' : 'CPU';
    
    
    processingMode.textContent = modeText;
    
    let progressInterval;
    const startTime = Date.now();
    
    try {
        // Simular progreso
        let progress = 0;
        progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            progressFill.style.width = `${progress}%`;
        }, 500);
        
        const response = await fetch('/api/loop-video', {
            method: 'POST',
            body: formData
        });
        
        clearInterval(progressInterval);
        progressFill.style.width = '100%';
        progressText.textContent = 'Completado!';
        
        const result = await response.json();
        
        if (result.success) {
            // Calcular tiempo de procesamiento
            const endTime = Date.now();
            const processingDuration = ((endTime - startTime) / 1000).toFixed(2);
            
            // Mostrar información de procesamiento
            processingTime.textContent = `${processingDuration}s`;
            processingInfo.style.display = 'flex';
            
            
            // Ocultar progreso
            setTimeout(() => {
                progressSection.style.display = 'none';
            }, 3000); // Mostrar por 3 segundos para ver el tiempo
            
            // Mostrar resultados con información de procesamiento
            showLoopResults(result, processingDuration, modeText);
            showNotification(`Loop de video creado exitosamente en ${processingDuration}s`, 'success');
        } else {
            throw new Error(result.error || 'Error desconocido');
        }
        
    } catch (error) {
        if (progressInterval) {
            clearInterval(progressInterval);
        }
        progressSection.style.display = 'none';
        showNotification(`Error: ${error.message}`, 'error');
        console.error('Error creando loop:', error);
    }
}

// Mostrar resultados de loop de video
function showLoopResults(result, processingTime = null, processingMode = null) {
    const resultsSection = document.getElementById('loopResultsSection');
    const videoPlayer = document.getElementById('loopVideoPlayer');
    const videoDetails = document.getElementById('loopVideoDetails');
    
    // Guardar URL del video
    currentLoopVideoUrl = result.video_url;
    
    // Mostrar reproductor de video
    videoPlayer.innerHTML = `
        <video controls style="width: 100%; max-width: 600px; border-radius: 8px;">
            <source src="${result.video_url}" type="video/mp4">
            Tu navegador no soporta el elemento video.
        </video>
    `;
    
    // Mostrar detalles
    const details = result.video_details;
    let detailsHTML = `
        <div class="detail-item">
            <span class="detail-label">Duración Original</span>
            <span class="detail-value">${details.original_duration}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Duración Final</span>
            <span class="detail-value">${details.final_duration}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Loops Creados</span>
            <span class="detail-value">${details.loops_created}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Tamaño</span>
            <span class="detail-value">${details.size}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Resolución</span>
            <span class="detail-value">${details.resolution}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Formato</span>
            <span class="detail-value">${details.format}</span>
        </div>`;
    
    // Agregar información de procesamiento si está disponible
    if (processingTime && processingMode) {
        detailsHTML += `
        <div class="detail-item">
            <span class="detail-label">Modo de Procesamiento</span>
            <span class="detail-value">${processingMode}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Tiempo de Procesamiento</span>
            <span class="detail-value">${processingTime}s</span>
        </div>`;
    }
    
    videoDetails.innerHTML = detailsHTML;
    resultsSection.style.display = 'block';
}

// Descargar video loop
function downloadLoopVideo() {
    if (currentLoopVideoUrl) {
        const link = document.createElement('a');
        link.href = currentLoopVideoUrl;
        link.download = 'video_loop.mp4';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        showNotification('No hay video para descargar', 'error');
    }
}

// Funciones globales para uso en HTML
window.downloadSubtitles = downloadSubtitles;
window.downloadAudio = downloadAudio;
window.downloadMergedVideo = downloadMergedVideo;
window.downloadLoopVideo = downloadLoopVideo;
window.toggleTheme = toggleTheme;
window.resetThemeDetection = resetThemeDetection;
window.forceAutoTheme = forceAutoTheme;
window.clearAllThemeSettings = clearAllThemeSettings;
window.clearVideoSelection = clearVideoSelection;
window.clearLoopForm = clearLoopForm;
window.addNewTab = addNewTab;
window.showTabTemplates = showTabTemplates;
window.removeDynamicTab = removeDynamicTab;
window.calcInput = calcInput;
window.calcEquals = calcEquals;
window.addTodo = addTodo;
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;
window.processVideoMerge = processVideoMerge;
window.createVideoLoop = createVideoLoop;
window.clearGcsBucket = clearGcsBucket;
window.viewGcsBucket = viewGcsBucket;
// Cargar voces dinámicamente desde el backend
async function fetchVoiceOptionsForLanguage(language) {
    try {
        // Ajuste de códigos: chino mandarín y posibles variantes
        const lang = language === 'zh-CN' ? 'cmn-CN' : language;
        const res = await fetch(`/api/voices?language=${encodeURIComponent(lang)}`);
        const data = await res.json();
        if (!data.success) return [];
        let voices = (data.voices || []).filter(v => (v.language_codes || []).includes(lang));
        // Fallback para idiomas sin voces reportadas (ej. es-MX): usar es-ES
        if (voices.length === 0 && language === 'es-MX') {
            const resEs = await fetch('/api/voices?language=es-ES');
            const dataEs = await resEs.json();
            if (dataEs.success) {
                voices = (dataEs.voices || []).filter(v => (v.language_codes || []).includes('es-ES'));
            }
        }
        return voices.map(v => ({ value: v.name, text: v.name, gender: normalizeGender(v.ssml_gender) }));
    } catch (e) {
        return [];
    }
}

function normalizeGender(g) {
    const s = String(g || '').toLowerCase();
    if (s.includes('female')) return 'female';
    if (s.includes('male')) return 'male';
    return '';
}
