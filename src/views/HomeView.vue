<template>
    <div class="wedding-page">
        <!-- Hero: Título e Data -->
        <section class="hero-section">
            <div class="hero-overlay">
                <div class="hero-content">
                    <h2 class="pre-title">Celebre conosco o casamento de</h2>
                    <h1 class="names">Ana <span class="ampersand">&</span> Josué</h1>
                    <div class="divider"></div>
                    <p class="date">27 de Novembro de 2026</p>
                </div>
            </div>
        </section>

        <!-- Seção: Confirmação de Presença -->
        <section class="rsvp-section">
            <div class="section-container">
                <h2 class="section-title">Confirme sua Presença</h2>
                <p class="section-subtitle">Por favor, informe-nos se você poderá comparecer a este dia tão especial.</p>
                
                <form @submit.prevent="confirmarPresenca" class="rsvp-form">
                    <div class="input-group">
                        <input 
                            v-model="formPresenca.nome" 
                            type="text" 
                            placeholder="Seu nome completo" 
                            required 
                        />
                    </div>
                    
                    <p class="question">Você estará presente?</p>
                    <div class="radio-options">
                        <button 
                            type="button" 
                            class="radio-btn"
                            :class="{ active: formPresenca.vai === true }"
                            @click="formPresenca.vai = true"
                        >
                            Sim, estarei lá
                        </button>
                        <button 
                            type="button" 
                            class="radio-btn"
                            :class="{ active: formPresenca.vai === false }"
                            @click="formPresenca.vai = false"
                        >
                            Não poderei ir
                        </button>
                    </div>

                    <button type="submit" class="btn-submit">Enviar Confirmação</button>
                </form>
            </div>
        </section>

        <!-- Seção: Lista de Presentes -->
        <section class="gifts-section">
            <div class="section-container">
                <h2 class="section-title">Lista de Presentes</h2>
                <p class="section-subtitle">Sua presença é nosso maior presente. Mas, se desejar nos presentear, escolha uma das opções abaixo.</p>
                
                <div class="cards-grid">
                    <div class="gift-card" v-for="valor in valores" :key="valor">
                        <div class="card-ornament">🌿</div>
                        <h3 class="card-title">Cartão Presente</h3>
                        <p class="card-price">R$ {{ valor }},00</p>
                        <button @click="abrirModal(valor)" class="btn-gift">Presentear</button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Modal de Pagamento -->
        <div v-if="modalAberto" class="modal-overlay" @click.self="fecharModal">
            <div class="modal-card">
                <button class="close-btn" @click="fecharModal">&times;</button>
                <h3 class="modal-title">Presentear com R$ {{ valorSelecionado }},00</h3>
                
                <div v-if="!chavePixGerada" class="modal-form">
                    <input v-model="formPresente.nome" type="text" placeholder="Seu nome completo" required />
                    <textarea v-model="formPresente.mensagem" placeholder="Deixe uma mensagem para os noivos (opcional)" rows="3"></textarea>
                    
                    <button @click="gerarPresente" class="btn-submit mt-2">Gerar PIX</button>
                </div>

                <div v-else class="pix-container">
                    <p class="pix-thanks">Obrigado, <strong>{{ formPresente.nome }}</strong>! ❤️</p>
                    <p class="pix-instrucoes">Copie a chave abaixo e realize o PIX pelo seu banco:</p>
                    <div class="pix-key">sua-chave-pix-aqui@email.com</div>
                    <button @click="fecharModal" class="btn-submit mt-2">Pronto, já paguei!</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'

// Estado do formulário de presença
const formPresenca = ref({
    nome: '',
    vai: null
})

// Valores disponíveis para presentes
const valores = [50, 100, 150, 200, 250, 300]
const modalAberto = ref(false)
const valorSelecionado = ref(0)
const chavePixGerada = ref(false)

// Estado do formulário de presente
const formPresente = ref({
    nome: '',
    mensagem: ''
})

// Função para confirmar presença no banco
const confirmarPresenca = async () => {
    if (formPresenca.value.vai === null) {
        alert('Por favor, selecione se você irá comparecer.')
        return
    }

    const { error } = await supabase
        .from('presencas')
        .insert([{ 
            nome_completo: formPresenca.value.nome, 
            vai_comparecer: formPresenca.value.vai 
        }])
    
    if (!error) {
        alert('Sua confirmação foi enviada com sucesso!')
        formPresenca.value.nome = ''
        formPresenca.value.vai = null
    } else {
        alert('Erro ao enviar, tente novamente mais tarde.')
    }
}

// Abre o modal de presente
const abrirModal = (valor) => {
    valorSelecionado.value = valor
    modalAberto.value = true
    chavePixGerada.value = false
}

// Fecha e limpa o modal
const fecharModal = () => {
    modalAberto.value = false
    formPresente.value.nome = ''
    formPresente.value.mensagem = ''
}

// Grava o presente e exibe a tela de PIX
const gerarPresente = async () => {
    if (!formPresente.value.nome) {
        alert('Precisamos saber quem está nos presenteando! Insira seu nome.')
        return
    }

    const { error } = await supabase
        .from('presentes')
        .insert([{ 
            nome_convidado: formPresente.value.nome, 
            valor: valorSelecionado.value, 
            mensagem: formPresente.value.mensagem 
        }])
    
    if (!error) {
        chavePixGerada.value = true
    } else {
        alert('Erro ao processar. Tente novamente.')
    }
}
</script>

<style scoped>
/* Importa fontes elegantes do Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Poppins:wght@300;400;500&display=swap');

    /* Paleta de cores e tipografia base */
    .wedding-page {
        --color-primary: #C19A6B; /* Dourado suave/Champagne */
        --color-bg: #FCF9F5; /* Creme bem claro */
        --color-text: #4A4A4A; /* Cinza escuro para leitura */
        --color-white: #FFFFFF;
        
        font-family: 'Poppins', sans-serif;
        color: var(--color-text);
        background-color: var(--color-bg);
    }

    * {
        margin: 0;
        padding: 0;
    }

    /* Seção 1: Hero (Capa) */
    .hero-section {
        height: 100vh;
        position: relative;
        background-size: cover;
        background-position: center;
        /* background-attachment: fixed; */
        background-image: url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop'); /* Imagem provisória de casamento */
    }

    .hero-overlay {
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        position: absolute;
        text-align: center;
        backdrop-filter: blur(3px);
        align-items: center;
        background: #ffecd4bf;
        justify-content: center;
    }

    .hero-content {
        padding: 20px;
    }

    .pre-title {
        font-size: 1.2rem;
        font-weight: 600;
        font-style: italic;
        margin-bottom: -15px;
        color: var(--color-text);
        font-family: 'Playfair Display', serif;
    }

    .names {
        margin: 20px 0;
        font-size: 5rem;
        color: var(--color-primary);
        font-family: 'Great Vibes', cursive;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.05);
    }

    .ampersand {
        font-size: 3rem;
        color: var(--color-text);
        font-family: 'Playfair Display', serif;
    }

    .divider {
        width: 60px;
        height: 2px;
        background-color: var(--color-primary);
        margin: 0 auto 20px;
    }

    .date {
        font-weight: 600;
        font-size: 1.5rem;
        letter-spacing: 2px;
        text-transform: uppercase;
        font-family: 'Playfair Display', serif;
    }

/* Layout Geral das Seções */
.rsvp-section, .gifts-section {
    padding: 80px 20px;
    text-align: center;
}

.gifts-section {
    background-color: var(--color-white);
}

.section-container {
    max-width: 800px;
    margin: 0 auto;
}

.section-title {
    font-family: 'Playfair Display', serif;
    font-size: 2.5rem;
    color: var(--color-primary);
    margin-bottom: 10px;
}

.section-subtitle {
    font-size: 1rem;
    color: #777;
    margin-bottom: 40px;
}

/* Formulário de Presença */
.rsvp-form {
    background: var(--color-white);
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    border: 1px solid rgba(193, 154, 107, 0.2);
}

input[type="text"], textarea {
    width: 100%;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-family: 'Poppins', sans-serif;
    font-size: 1rem;
    background-color: var(--color-bg);
    transition: all 0.3s;
    box-sizing: border-box;
    margin-bottom: 20px;
}

input[type="text"]:focus, textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(193, 154, 107, 0.2);
}

.question {
    font-weight: 500;
    margin-bottom: 15px;
}

.radio-options {
    display: flex;
    gap: 15px;
    margin-bottom: 30px;
}

.radio-btn {
    flex: 1;
    padding: 12px;
    background: transparent;
    border: 1px solid var(--color-primary);
    color: var(--color-primary);
    border-radius: 6px;
    cursor: pointer;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    transition: all 0.3s;
}

.radio-btn.active, .radio-btn:hover {
    background: var(--color-primary);
    color: var(--color-white);
}

.btn-submit {
    background: var(--color-primary);
    color: var(--color-white);
    border: none;
    padding: 15px 30px;
    border-radius: 6px;
    font-size: 1rem;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    cursor: pointer;
    width: 100%;
    transition: background 0.3s;
}

.btn-submit:hover {
    background: #a6845c;
}

/* Cards de Presentes */
.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 30px;
}

.gift-card {
    background: var(--color-bg);
    padding: 30px 20px;
    border-radius: 12px;
    border: 1px solid rgba(193, 154, 107, 0.2);
    box-shadow: 0 5px 15px rgba(0,0,0,0.03);
    transition: transform 0.3s ease;
}

.gift-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.06);
}

.card-ornament {
    font-size: 2rem;
    margin-bottom: 10px;
}

.card-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem;
    margin-bottom: 5px;
}

.card-price {
    font-size: 1.5rem;
    color: var(--color-primary);
    font-weight: 600;
    margin-bottom: 20px;
}

.btn-gift {
    background: transparent;
    color: var(--color-primary);
    border: 1px solid var(--color-primary);
    padding: 10px 20px;
    border-radius: 20px;
    cursor: pointer;
    font-family: 'Poppins', sans-serif;
    transition: all 0.3s;
    width: 100%;
}

.btn-gift:hover {
    background: var(--color-primary);
    color: var(--color-white);
}

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(3px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-card {
    background: var(--color-white);
    padding: 40px;
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    position: relative;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

.close-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #999;
    transition: color 0.3s;
}

.close-btn:hover {
    color: var(--color-text);
}

.modal-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    color: var(--color-primary);
    margin-bottom: 20px;
    text-align: center;
}

.mt-2 {
    margin-top: 20px;
}

.pix-container {
    text-align: center;
}

.pix-thanks {
    font-size: 1.1rem;
    margin-bottom: 10px;
}

.pix-instrucoes {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 15px;
}

.pix-key {
    background: var(--color-bg);
    padding: 15px;
    border: 1px dashed var(--color-primary);
    border-radius: 6px;
    font-family: monospace;
    font-size: 1.1rem;
    word-break: break-all;
}

/* Responsividade Mobile */
@media (max-width: 600px) {
    .names {
        font-size: 3.5rem;
    }
    
    .ampersand {
        font-size: 2rem;
    }
    
    .radio-options {
        flex-direction: column;
    }
}
</style>