const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- ESTADOS DO JOGO ---
// Utilizar um sistema de estados (State Machine) ajuda a organizar em qual tela o jogo está.
const GameState = {
    INTRO: 'intro',       // História inicial
    TUTORIAL: 'tutorial', // Tela de explicação antes de jogar
    PLAYING: 'playing',   // Jogador está interagindo
    RESULT: 'result',     // Tela de correção
    END: 'end'            // Fim do jogo
};

let currentState = GameState.INTRO;

// --- SISTEMA DE NÍVEIS ---
// Cada nível introduz uma pontuação e uma frase diferente, aumentando a complexidade.
// As frases utilizadas são adaptações de trechos de livros infantis famosos.
const levels = [
    {
        tutorial: {
            title: "O Ponto Final (.)",
            text: "Usamos o ponto final para encerrar uma ideia ou frase. (De 'O Pequeno Príncipe')"
        },
        words: ["O", "essencial", "é", "invisível", "aos", "olhos"],
        correctPunctuation: {
            5: "."
        }
    },
    {
        tutorial: {
            title: "A Vírgula (,)",
            text: "A vírgula indica uma pausa e separa itens. (De 'Alice no País das Maravilhas')"
        },
        words: ["A", "menina", "pegou", "a", "chave", "abriu", "a", "porta", "e", "sorriu"],
        correctPunctuation: {
            4: ",",
            9: "."
        }
    },
    {
        tutorial: {
            title: "Exclamação e Interrogação (!, ?)",
            text: "O (!) expressa emoção. O (?) é usado em perguntas. (De 'Branca de Neve')"
        },
        words: ["Espelho", "meu", "Existe", "alguém", "mais", "bela", "que", "eu"],
        correctPunctuation: {
            1: "!",
            7: "?"
        }
    },
    {
        tutorial: {
            title: "Dois-pontos (:)",
            text: "Os dois-pontos (:) anunciam uma fala, citação ou enumeração. (De 'O Mágico de Oz')"
        },
        words: ["Dorothy", "disse", "Não", "há", "lugar", "como", "nosso", "lar"],
        correctPunctuation: {
            1: ":",
            7: "!"
        }
    },
    {
        tutorial: {
            title: "Vírgulas numa Lista (,)",
            text: "Use a vírgula para listar nomes ou coisas. (De 'Peter Pan')"
        },
        words: ["Wendy", "João", "e", "Miguel", "voaram"],
        correctPunctuation: {
            0: ",",
            4: "."
        }
    },
    {
        tutorial: {
            title: "Admiração e Ponto (!, .)",
            text: "A exclamação mostra surpresa, e o ponto encerra a próxima ideia. (De 'Sítio do Picapau Amarelo')"
        },
        words: ["Que", "boneca", "falante", "Ela", "não", "para"],
        correctPunctuation: {
            2: "!",
            5: "."
        }
    },
    {
        tutorial: {
            title: "O Ponto e Vírgula (;)",
            text: "Indica uma pausa maior que a vírgula, separando duas partes da frase. (De 'Pinóquio')"
        },
        words: ["O", "grilo", "falou", "a", "verdade", "o", "menino", "mentiu"],
        correctPunctuation: {
            4: ";",
            7: "."
        }
    },
    {
        tutorial: {
            title: "O Vocativo e a Pergunta (, e ?)",
            text: "A vírgula separa quem estamos chamando (o vocativo). (De 'Chapeuzinho Vermelho')"
        },
        words: ["Vovó", "por", "que", "essas", "orelhas", "grandes"],
        correctPunctuation: {
            0: ",",
            5: "?"
        }
    },
    {
        tutorial: {
            title: "Fala com Exclamação (:, !)",
            text: "Os dois-pontos anunciam a fala e a exclamação dá emoção! (De 'Os Três Porquinhos')"
        },
        words: ["O", "lobo", "mau", "gritou", "Eu", "vou", "soprar"],
        correctPunctuation: {
            3: ":",
            6: "!"
        }
    },
    {
        tutorial: {
            title: "O Travessão como Pausa (-)",
            text: "O travessão pode ser usado para dar um destaque forte em uma explicação. (De 'João e Maria')"
        },
        words: ["A", "floresta", "era", "escura", "muito", "escura"],
        correctPunctuation: {
            3: "-",
            5: "."
        }
    },
    {
        tutorial: {
            title: "Descrevendo com Vírgulas (,)",
            text: "Vírgulas separam as características de um personagem divertido. (De 'O Menino Maluquinho')"
        },
        words: ["Ele", "usava", "calças", "largas", "tênis", "sujo", "e", "panela"],
        correctPunctuation: {
            3: ",",
            7: "."
        }
    },
    {
        tutorial: {
            title: "Ação e Consequência (!, .)",
            text: "Use exclamação para o susto e ponto final para o resultado. (De 'A Bela Adormecida')"
        },
        words: ["Malévola", "lançou", "o", "feitiço", "A", "princesa", "dormiu"],
        correctPunctuation: {
            3: "!",
            6: "."
        }
    },
    {
        tutorial: {
            title: "Educação em Pergunta (, e ?)",
            text: "Sempre separe expressões como 'Com licença' com vírgula. (De 'Cinderela')"
        },
        words: ["Com", "licença", "você", "perdeu", "este", "sapato"],
        correctPunctuation: {
            1: ",",
            5: "?"
        }
    },
    {
        tutorial: {
            title: "Pensamentos Silenciosos (: e .)",
            text: "Dois-pontos também servem para introduzir os pensamentos de alguém. (De 'O Patinho Feio')"
        },
        words: ["A", "mãe", "pata", "pensou", "Este", "filhote", "é", "diferente"],
        correctPunctuation: {
            3: ":",
            7: "."
        }
    }
];


let currentLevelIndex = 0; // Controla em qual nível estamos
let seenPunctuation = new Set(); // Rastreia pontuações já explicadas

// Armazena as pontuações inseridas pelo jogador { indice_do_slot: "pontuação" }
let userPunctuation = {};
let selectedSlot = null; // Guarda o índice do slot que o jogador clicou por último

// Dados para detecção de clique no Canvas
let slotsData = [];

// Imagens
let witchImage = new Image();
witchImage.src = 'witch.png';

// Configurações visuais e de medidas
const config = {
    startX: 50,
    startY: 80,
    lineHeight: 60,
    fontSize: '44px VT323',
    wordSpacing: 15,
    slotWidth: 35,
    slotColor: '#8b5a2b',
    selectedSlotColor: '#9b59b6',
    textColor: '#2c1e16',
    correctColor: '#27ae60',
    wrongColor: '#c0392b'
};

// --- FUNÇÃO DE INICIALIZAÇÃO ---
function init() {
    setupEventListeners();

    // Marca pontuações do primeiro nível como vistas, pois o jogo sempre começa no tutorial do nível 0
    let firstLevel = levels[currentLevelIndex];
    for (let key in firstLevel.correctPunctuation) {
        seenPunctuation.add(firstLevel.correctPunctuation[key]);
    }

    updateUIState();
    gameLoop(); // Inicia o loop do jogo
}

// --- GAME LOOP ---
// O Game Loop roda continuamente, atualizando a lógica e renderizando a tela a cada quadro (frame).
function gameLoop() {
    update(); // Atualiza a lógica
    draw();   // Renderiza na tela
    requestAnimationFrame(gameLoop); // Chama o loop novamente no próximo quadro
}

// --- UPDATE ---
// Processa a lógica contínua. Neste jogo, as ações vêm via eventos (cliques), 
// então não temos atualizações frame-a-frame de física aqui.
function update() {
}

// --- DRAW (RENDERIZAÇÃO) ---
function draw() {
    // 1. Limpa o frame anterior para desenhar o novo
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Desenha o fundo do Livro Mágico (Pergaminho)
    drawBookBackground();

    // 3. Decide o que desenhar com base no estado atual
    if (currentState === GameState.INTRO) {
        drawIntro();
    } else if (currentState === GameState.TUTORIAL) {
        drawTutorial();
    } else if (currentState === GameState.PLAYING) {
        drawTextAndSlots();
    } else if (currentState === GameState.RESULT) {
        drawResult();
    } else if (currentState === GameState.END) {
        drawEnd();
    }
}

function drawBookBackground() {
    // Capa de couro escuro
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Páginas
    ctx.fillStyle = '#f4e4bc';
    ctx.fillRect(20, 20, canvas.width / 2 - 20, canvas.height - 40);
    ctx.fillStyle = '#eaddb0';
    ctx.fillRect(canvas.width / 2, 20, canvas.width / 2 - 20, canvas.height - 40);

    // Dobra central
    // ctx.beginPath();
    // ctx.moveTo(canvas.width/2, 20);
    // ctx.lineTo(canvas.width/2, canvas.height - 20);
    // ctx.strokeStyle = '#c9b082';
    // ctx.lineWidth = 4;
    // ctx.stroke();

    // Borda das páginas (detalhe)
    // ctx.strokeStyle = '#d7c49e';
    // ctx.lineWidth = 2;
    // ctx.strokeRect(24, 24, canvas.width / 2 - 28, canvas.height - 48);
    // ctx.strokeRect(canvas.width / 2 + 4, 24, canvas.width / 2 - 28, canvas.height - 48);
}

// --- FUNÇÕES DE DESENHO DE TELAS ---

// Renderiza a história inicial com a Bruxinha
function drawIntro() {
    ctx.fillStyle = config.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '50px VT323';
    ctx.fillText("Um Desastre na Biblioteca!", canvas.width / 2, 80);

    // Desenha a bruxinha à esquerda
    if (witchImage.complete) {
        ctx.drawImage(witchImage, 40, 110, 250, 250);
    }

    // Desenha a caixa de diálogo à direita
    ctx.fillStyle = '#5c3a21';
    ctx.font = '26px VT323';
    ctx.textAlign = 'left';

    let text = "Oh não! Os feitiços a Biblioteca Mágica estão uma bagunça! As pontuações caíram das páginas e agora as histórias não fazem sentido. Por favor, jovem aprendiz, me ajude a colocá-las no lugar certo!";

    let words = text.split(" ");
    let line = "";
    let y = 160;
    let x = 320;

    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + " ";
        let metrics = ctx.measureText(testLine);
        if (metrics.width > canvas.width - x - 40 && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + " ";
            y += 40;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
}

// Renderiza a tela de Tutorial, explicando a pontuação atual
function drawTutorial() {
    let tutorial = levels[currentLevelIndex].tutorial;

    ctx.fillStyle = config.textColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    // Desenha o Título do tutorial
    ctx.font = '50px VT323';
    ctx.fillText(tutorial.title, canvas.width / 2, canvas.height / 2 - 40);

    // Desenha o texto explicativo (com quebra de linha simples)
    ctx.font = '36px VT323';
    ctx.fillStyle = '#5c3a21';

    let words = tutorial.text.split(" ");
    let line = "";
    let y = canvas.height / 2 + 20;

    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + " ";
        let metrics = ctx.measureText(testLine);
        if (metrics.width > canvas.width - 100 && n > 0) {
            ctx.fillText(line, canvas.width / 2, y);
            line = words[n] + " ";
            y += 35;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, canvas.width / 2, y);

    // Reseta o alinhamento para não quebrar outras telas que desenham da esquerda pra direita
    ctx.textAlign = 'left';
}

// Renderiza a fase onde o jogador insere as pontuações
function drawTextAndSlots() {
    ctx.font = config.fontSize;
    ctx.textBaseline = 'middle';

    let currentX = config.startX;
    let currentY = config.startY;
    let currentLevel = levels[currentLevelIndex];

    slotsData = []; // Zera os dados de colisão do frame anterior

    currentLevel.words.forEach((word, index) => {
        let wordWidth = ctx.measureText(word).width;

        // Quebra de linha se a palavra + slot for ultrapassar a largura do canvas
        if (currentX + wordWidth + config.slotWidth + config.wordSpacing > canvas.width - config.startX) {
            currentX = config.startX;
            currentY += config.lineHeight;
        }

        // Desenha a palavra
        ctx.fillStyle = config.textColor;
        ctx.fillText(word, currentX, currentY);
        currentX += wordWidth;

        // Calcula a posição do espaço em branco (Slot de pontuação)
        let slotX = currentX + 5;
        let slotY = currentY - 20;
        let slotHeight = 40;

        // Armazena as coordenadas para detectar o clique do mouse depois
        slotsData.push({
            index: index,
            x: slotX,
            y: slotY,
            width: config.slotWidth,
            height: slotHeight
        });

        // Feedback visual se o slot estiver selecionado
        if (selectedSlot === index) {
            ctx.strokeStyle = config.selectedSlotColor;
            ctx.lineWidth = 3;
            ctx.fillStyle = "rgba(231, 76, 60, 0.1)";
            ctx.fillRect(slotX, slotY, config.slotWidth, slotHeight);
        } else {
            ctx.strokeStyle = config.slotColor;
            ctx.lineWidth = 2;
        }

        // Se há uma pontuação preenchida pelo jogador, desenha ela
        if (userPunctuation[index]) {
            ctx.fillStyle = config.selectedSlotColor;
            ctx.fillText(userPunctuation[index], slotX + 8, currentY);
        } else {
            // Desenha a linha tracejada
            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.moveTo(slotX, currentY + 15);
            ctx.lineTo(slotX + config.slotWidth - 10, currentY + 15);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        currentX += config.slotWidth + config.wordSpacing;
    });
}

// Renderiza a tela de correção comparando respostas do jogador com o gabarito
function drawResult() {
    ctx.font = config.fontSize;
    ctx.textBaseline = 'middle';

    let currentX = config.startX;
    let currentY = config.startY;
    let currentLevel = levels[currentLevelIndex];
    let acertos = 0;
    let totalPontuacoes = Object.keys(currentLevel.correctPunctuation).length;

    ctx.fillStyle = config.textColor;
    ctx.font = '48px VT323';
    ctx.fillText("Correção:", config.startX, config.startY - 40);
    ctx.font = config.fontSize;

    currentLevel.words.forEach((word, index) => {
        let wordWidth = ctx.measureText(word).width;

        if (currentX + wordWidth + 60 > canvas.width - config.startX) {
            currentX = config.startX;
            currentY += config.lineHeight;
        }

        ctx.fillStyle = config.textColor;
        ctx.fillText(word, currentX, currentY);
        currentX += wordWidth;

        let userPunct = userPunctuation[index];
        let correctPunct = currentLevel.correctPunctuation[index];

        // Lógica de verificação para desenhar acertos e erros na tela
        if (userPunct || correctPunct) {
            if (userPunct === correctPunct) {
                // ACERTOU
                ctx.fillStyle = config.correctColor;
                ctx.fillText(userPunct, currentX + 5, currentY);
                if (correctPunct) acertos++;
                currentX += ctx.measureText(userPunct).width + 10;
            } else {
                // ERROU
                if (userPunct) {
                    ctx.fillStyle = config.wrongColor;
                    ctx.fillText(userPunct, currentX + 5, currentY);

                    // Traço vermelho sobre o erro do jogador
                    ctx.beginPath();
                    ctx.moveTo(currentX + 5, currentY);
                    ctx.lineTo(currentX + 5 + ctx.measureText(userPunct).width, currentY);
                    ctx.strokeStyle = config.wrongColor;
                    ctx.lineWidth = 3;
                    ctx.stroke();

                    currentX += ctx.measureText(userPunct).width + 5;
                }
                if (correctPunct) {
                    // Verde mostrando qual era a resposta correta
                    ctx.fillStyle = config.correctColor;
                    ctx.fillText(correctPunct, currentX + 5, currentY);
                    currentX += ctx.measureText(correctPunct).width + 10;
                }
            }
        }
        currentX += config.wordSpacing;
    });

    ctx.fillStyle = '#5c3a21';
    ctx.font = '36px VT323';
    ctx.fillText(`Acertos: ${acertos} de ${totalPontuacoes}`, config.startX, currentY + 100);
}

// Renderiza a tela de Conclusão após todos os níveis
function drawEnd() {
    ctx.fillStyle = config.textColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    ctx.font = '64px VT323';
    ctx.fillStyle = config.correctColor;
    ctx.fillText("Parabéns!", canvas.width / 2, canvas.height / 2 - 40);

    ctx.font = '40px VT323';
    ctx.fillStyle = '#5c3a21';
    ctx.fillText("O Grimório foi completado.", canvas.width / 2, canvas.height / 2 + 20);
    ctx.textAlign = 'left';
}

// --- EVENTOS E INTERFACE (DOM) ---

// Essa função coordena a visibilidade dos elementos HTML baseada no estado do canvas
function updateUIState() {
    const btnSubmit = document.getElementById('btn-submit');
    const btnNext = document.getElementById('btn-next');
    const punctButtons = document.getElementById('punctuation-buttons');
    const instructions = document.querySelector('.instructions');

    if (currentState === GameState.INTRO) {
        btnSubmit.style.display = 'none';
        punctButtons.style.display = 'none';
        btnNext.style.display = 'block';
        btnNext.textContent = 'Ajudar a Bruxa!';
        instructions.textContent = "Conheça a sua mestra mágica.";
    } else if (currentState === GameState.TUTORIAL) {
        btnSubmit.style.display = 'none';
        punctButtons.style.display = 'none';
        btnNext.style.display = 'block';
        btnNext.textContent = 'Iniciar Nível';
        instructions.textContent = `Nível ${currentLevelIndex + 1} - Leia a explicação antes de começar!`;
    } else if (currentState === GameState.PLAYING) {
        btnSubmit.style.display = 'block';
        punctButtons.style.display = 'flex';
        btnNext.style.display = 'none';
        instructions.textContent = "Clique nos espaços tracejados e escolha a pontuação correta.";
    } else if (currentState === GameState.RESULT) {
        btnSubmit.style.display = 'none';
        punctButtons.style.display = 'none';
        btnNext.style.display = 'block';
        btnNext.textContent = currentLevelIndex < levels.length - 1 ? 'Próximo Nível' : 'Finalizar Jogo';
        instructions.textContent = "Resultados da sua avaliação:";
    } else if (currentState === GameState.END) {
        btnSubmit.style.display = 'none';
        punctButtons.style.display = 'none';
        btnNext.style.display = 'none';
        instructions.textContent = "Jogo Finalizado.";
    }
}

function setupEventListeners() {
    // Escuta cliques no Canvas para selecionar slots
    canvas.addEventListener('mousedown', (e) => {
        if (currentState !== GameState.PLAYING) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        let clickedSlot = null;

        // Verifica intersecção do clique com as coordenadas armazenadas em slotsData
        for (let slot of slotsData) {
            if (mouseX >= slot.x && mouseX <= slot.x + slot.width &&
                mouseY >= slot.y && mouseY <= slot.y + slot.height) {
                clickedSlot = slot.index;
                break;
            }
        }
        selectedSlot = clickedSlot;
    });

    // Escuta botões de pontuação (HTML)
    const punctButtons = document.querySelectorAll('.punct-btn');
    punctButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentState !== GameState.PLAYING || selectedSlot === null) return;

            const punct = btn.getAttribute('data-punct');
            if (punct) {
                userPunctuation[selectedSlot] = punct; // Salva a escolha do usuário

                // Qualidade de vida (QoL): Move automaticamente para a próxima palavra
                let currentLevel = levels[currentLevelIndex];
                if (selectedSlot < currentLevel.words.length - 1) {
                    selectedSlot++;
                }
            } else if (btn.id === 'btn-remove') {
                delete userPunctuation[selectedSlot];
            }
        });
    });

    // Botão de "Corrigir Pontuação"
    document.getElementById('btn-submit').addEventListener('click', () => {
        if (currentState === GameState.PLAYING) {
            currentState = GameState.RESULT; // Transição de estado para ver correção
            updateUIState();
        }
    });

    // Botão genérico "Continuar/Avançar"
    document.getElementById('btn-next').addEventListener('click', () => {
        if (currentState === GameState.INTRO) {
            currentState = GameState.TUTORIAL;
            updateUIState();
        } else if (currentState === GameState.TUTORIAL) {
            currentState = GameState.PLAYING;
            userPunctuation = {};
            selectedSlot = null;
            updateUIState();
        } else if (currentState === GameState.RESULT) {
            // Avança para o próximo nível ou finaliza o jogo
            if (currentLevelIndex < levels.length - 1) {
                currentLevelIndex++;

                let currentLevel = levels[currentLevelIndex];
                let hasNewPunctuation = false;

                for (let key in currentLevel.correctPunctuation) {
                    let punct = currentLevel.correctPunctuation[key];
                    if (!seenPunctuation.has(punct)) {
                        hasNewPunctuation = true;
                        seenPunctuation.add(punct);
                    }
                }

                if (hasNewPunctuation) {
                    currentState = GameState.TUTORIAL;
                } else {
                    currentState = GameState.PLAYING;
                    userPunctuation = {};
                    selectedSlot = null;
                }
            } else {
                currentState = GameState.END;
            }
            updateUIState();
        }
    });
}

// Iniciar o jogo
init();
