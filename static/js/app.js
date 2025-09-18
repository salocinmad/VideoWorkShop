// Variables globales
let currentSubtitles = null;
let currentAudioUrl = null;
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
    
    // Selector de idioma de voz
    const voiceLanguage = document.getElementById('voiceLanguage');
    if (voiceLanguage) {
        voiceLanguage.addEventListener('change', updateVoiceOptions);
        // Inicializar opciones de voz al cargar la página
        updateVoiceOptions();
    }
    
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
    
    // Mostrar reproductor de audio
    audioPlayer.innerHTML = `
        <audio controls style="width: 100%;">
            <source src="${result.audio_url}" type="audio/mpeg">
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
        link.download = 'audio.mp3';
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
    const voiceNameSelect = document.getElementById('voiceName');
    
    // Limpiar opciones actuales
    voiceNameSelect.innerHTML = '<option value="">Seleccionar voz...</option>';
    
    // Obtener opciones de voz
    const voiceOptions = getVoiceOptionsForLanguage(voiceLanguage);
    
    // Agregar opciones
    voiceOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        voiceNameSelect.appendChild(optionElement);
    });
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
        ]
    };
    
    return voiceOptions[language] || [];
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
