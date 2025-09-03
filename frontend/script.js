document.addEventListener('DOMContentLoaded', function () {

    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    const sections = document.querySelectorAll('main section');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 90) {
                current = section.getAttribute('id');
            }
        });

        navButtons.forEach(button => {
            button.classList.remove('active');
            if (button.getAttribute('data-target') === current) {
                button.classList.add('active');
            }
        });
    });

    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const icon = header.querySelector('span');

            document.querySelectorAll('.accordion-content').forEach(item => {
                if (item !== content) {
                    item.style.maxHeight = null;
                    item.previousElementSibling.querySelector('span').textContent = '+';
                }
            });

            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                icon.textContent = '+';
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.textContent = '-';
            }
        });
    });

    const ctx = document.getElementById('processChart').getContext('2d');
    const processChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Investigación y Pruebas', 'Asesoría Legal', 'Proceso Judicial', 'Registro Final'],
            datasets: [{
                label: 'Fases del Proceso',
                data: [25, 20, 45, 10],
                backgroundColor: [
                    '#A78BFA',
                    '#7C3AED',
                    '#5B21B6',
                    '#4C1D95'
                ],
                borderColor: '#FDFBF8',
                borderWidth: 4,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14,
                            family: 'Inter, sans-serif'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += context.parsed + '% Esfuerzo Estimado';
                            }
                            return label;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });

    const BACKEND_URL = 'http://localhost:3000';

    async function callBackendAPI(prompt, loaderElement, outputElement, copyButton, exportButton, generateButton) {
        loaderElement.classList.remove('hidden');
        outputElement.textContent = '';
        copyButton.classList.add('hidden');
        exportButton.classList.add('hidden');
        generateButton.disabled = true;
        generateButton.classList.add('opacity-50', 'cursor-not-allowed');

        try {
            const response = await fetch(`${BACKEND_URL}/api/generate-document`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                outputElement.textContent = result.content;
                copyButton.classList.remove('hidden');
                exportButton.classList.remove('hidden');
            } else {
                outputElement.textContent = result.error || 'Error al generar el documento';
            }
        } catch (error) {
            console.error('Error:', error);
            outputElement.textContent = 'Error de conexión con el servidor. Verifique que el backend esté ejecutándose.';
        } finally {
            loaderElement.classList.add('hidden');
            generateButton.disabled = false;
            generateButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    function showToast() {
        const toast = document.getElementById('toast');
        toast.classList.remove('opacity-0');
        setTimeout(() => {
            toast.classList.add('opacity-0');
        }, 2000);
    }

    function exportToDoc(content, filename) {
        const contentWithMime = '<html><body>' + content.replace(/\n/g, '<br>') + '</body></html>';
        const blob = new Blob([contentWithMime], { type: 'application/msword' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    function setupGenerator(buttonId, outputId, copyButtonId, exportButtonId, promptFunction, inputs) {
        const generateButton = document.getElementById(buttonId);
        const outputElement = document.getElementById(outputId);
        const copyButton = document.getElementById(copyButtonId);
        const exportButton = document.getElementById(exportButtonId);
        const loaderElement = document.getElementById(buttonId.replace('generate-', '') + '-loader');

        generateButton.addEventListener('click', () => {
            const inputValues = inputs.map(id => document.getElementById(id).value);
            if (inputValues.some(val => val.trim() === '')) {
                alert('Por favor, complete todos los campos.');
                return;
            }
            const prompt = promptFunction(...inputValues);
            callBackendAPI(prompt, loaderElement, outputElement, copyButton, exportButton, generateButton);
        });

        copyButton.addEventListener('click', () => {
            if (outputElement.textContent) {
                navigator.clipboard.writeText(outputElement.textContent).then(() => {
                    showToast();
                }).catch(err => console.error('Error al copiar texto: ', err));
            }
        });

        exportButton.addEventListener('click', () => {
            if (outputElement.textContent) {
                const filename = buttonId.includes('witness') ? 'declaracion_testigo.doc' : 'derecho_peticion.doc';
                exportToDoc(outputElement.textContent, filename);
            }
        });
    }

    setupGenerator(
        'generate-witness-statement',
        'witness-output',
        'copy-witness',
        'export-witness',
        (possessorName, neighborName, years) => `Actúa como un asistente legal experto en Colombia. Redacta un borrador formal y detallado de una declaración juramentada para un proceso de pertenencia. El poseedor se llama ${possessorName}, el testigo es su vecino, ${neighborName}, y el testigo puede dar fe de que ${possessorName} ha vivido en el inmueble de forma pública, pacífica e ininterrumpida por más de ${years} años. El documento debe incluir espacios para las firmas, números de cédula, y la fecha, y estar listo para ser adaptado y llevado a una notaría. Utiliza un lenguaje legal apropiado para Colombia.`,
        ['witness-possessor-name', 'witness-neighbor-name', 'witness-years']
    );

    setupGenerator(
        'generate-petition',
        'petition-output',
        'copy-petition',
        'export-petition',
        (applicantName, applicantId, address) => `Actúa como un asistente legal experto en Colombia. Redacta un borrador completo y formal de un derecho de petición dirigido a la Oficina de Registro de Instrumentos Públicos de [CIUDAD]. El solicitante es ${applicantName}, identificado con cédula de ciudadanía N° ${applicantId}. La petición es para solicitar la siguiente información sobre el inmueble ubicado en la dirección: ${address}: 1) El folio de matrícula inmobiliaria completo y actualizado. 2) Un historial detallado de todos los propietarios anteriores. 3) Un certificado de tradición y libertad que indique si existen gravámenes, embargos, hipotecas o cualquier otra limitación al dominio. El documento debe citar el artículo 23 de la Constitución Política de Colombia y la Ley 1755 de 2015, y debe incluir secciones claras para la notificación y firma del solicitante.`,
        ['petition-applicant-name', 'petition-applicant-id', 'petition-address']
    );

});
   