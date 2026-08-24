<template>
    <div class="admin-layout">
        <!-- Tela de Login -->
        <div v-if="!usuario" class="login-wrapper">
            <div class="login-card">
                <div class="login-header">
                    <h2>Painel dos Noivos</h2>
                    <p>Acesse para gerenciar seu evento</p>
                </div>
                <form @submit.prevent="login" class="login-form">
                    <div class="input-group">
                        <label>E-mail</label>
                        <input type="email" v-model="email" placeholder="contato@exemplo.com" required />
                    </div>
                    <div class="input-group">
                        <label>Senha</label>
                        <input type="password" v-model="senha" placeholder="••••••••" required />
                    </div>
                    <button type="submit" class="btn-primary" :disabled="loading">
                        {{ loading ? 'Autenticando...' : 'Acessar Painel' }}
                    </button>
                </form>
            </div>
        </div>

        <!-- Dashboard -->
        <div v-else class="dashboard">
            <!-- Barra Superior -->
            <nav class="topbar">
                <div class="topbar-brand">
                    <h2>Admin<span>Casamento</span></h2>
                </div>
                <div class="topbar-actions">
                    <span class="user-email">{{ usuario.email }}</span>
                    <button @click="logout" class="btn-outline">Sair</button>
                </div>
            </nav>

            <main class="content">
                <!-- Seção Presenças -->
                <section class="data-section">
                    <header class="section-header">
                        <h3>Confirmações de Presença</h3>
                        <span class="count-badge">{{ presencas.length }} registros</span>
                    </header>
                    
                    <div class="custom-table">
                        <!-- Cabeçalho Grid -->
                        <div class="t-header grid-presencas">
                            <span>Convidado</span>
                            <span>Status</span>
                            <span>Data de Registro</span>
                            <span class="text-right">Ações</span>
                        </div>

                        <!-- Corpo Grid -->
                        <div class="t-body">
                            <div v-if="presencas.length === 0" class="empty-state">
                                Nenhum dado encontrado.
                            </div>
                            
                            <div v-for="p in presencas" :key="p.id" class="t-row grid-presencas">
                                <div class="t-cell" data-label="Convidado">
                                    <span class="font-medium">{{ p.nome_completo }}</span>
                                </div>
                                <div class="t-cell" data-label="Status">
                                    <span :class="p.vai_comparecer ? 'status-pill green' : 'status-pill red'">
                                        {{ p.vai_comparecer ? 'Confirmado' : 'Ausente' }}
                                    </span>
                                </div>
                                <div class="t-cell" data-label="Data">
                                    {{ formatarData(p.created_at) }}
                                </div>
                                <div class="t-cell actions-cell" data-label="Ações">
                                    <button @click="alternarPresenca(p.id, p.vai_comparecer)" class="btn-icon">
                                        Alternar
                                    </button>
                                    <button @click="excluirPresenca(p.id)" class="btn-icon danger">
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Seção Presentes -->
                <section class="data-section">
                    <header class="section-header">
                        <h3>Presentes e PIX</h3>
                        <span class="count-badge">{{ presentes.length }} registros</span>
                    </header>
                    
                    <div class="custom-table">
                        <!-- Cabeçalho Grid -->
                        <div class="t-header grid-presentes">
                            <span>Convidado</span>
                            <span>Valor</span>
                            <span>Mensagem</span>
                            <span>Status</span>
                            <span class="text-right">Ações</span>
                        </div>

                        <!-- Corpo Grid -->
                        <div class="t-body">
                            <div v-if="presentes.length === 0" class="empty-state">
                                Nenhum dado encontrado.
                            </div>

                            <div v-for="g in presentes" :key="g.id" class="t-row grid-presentes">
                                <div class="t-cell" data-label="Convidado">
                                    <span class="font-medium">{{ g.nome_convidado }}</span>
                                </div>
                                <div class="t-cell" data-label="Valor">
                                    R$ {{ g.valor }},00
                                </div>
                                <!-- Tratamento para texto longo -->
                                <div class="t-cell msg-cell" data-label="Mensagem" :title="g.mensagem">
                                    <span class="msg-text">{{ g.mensagem || '—' }}</span>
                                </div>
                                <div class="t-cell" data-label="Status">
                                    <span :class="g.status === 'pago' ? 'status-pill green' : 'status-pill yellow'">
                                        {{ g.status === 'pago' ? 'Recebido' : 'Pendente' }}
                                    </span>
                                </div>
                                <div class="t-cell actions-cell" data-label="Ações">
                                    <button 
                                        @click="alternarStatusPresente(g.id, g.status)" 
                                        :class="g.status === 'pendente' ? 'btn-icon success' : 'btn-icon'"
                                    >
                                        {{ g.status === 'pendente' ? 'Confirmar' : 'Desfazer' }}
                                    </button>
                                    <button @click="excluirPresente(g.id)" class="btn-icon danger">
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'

// Estados globais
const usuario = ref(null)
const email = ref('')
const senha = ref('')
const loading = ref(false)
const presencas = ref([])
const presentes = ref([])

// Verifica sessão
onMounted(async () => {
    const { data } = await supabase.auth.getSession()
    usuario.value = data.session?.user || null
    if (usuario.value) buscarDados()
})

// Login
const login = async () => {
    loading.value = true
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: senha.value
    })
    loading.value = false

    if (error) alert('Credenciais inválidas.')
    else {
        usuario.value = data.user
        buscarDados()
    }
}

// Logout
const logout = async () => {
    await supabase.auth.signOut()
    usuario.value = null
    presencas.value = []
    presentes.value = []
}

// Busca dados
const buscarDados = async () => {
    const [resPresencas, resPresentes] = await Promise.all([
        supabase.from('presencas').select('*').order('created_at', { ascending: false }),
        supabase.from('presentes').select('*').order('created_at', { ascending: false })
    ])

    if (!resPresencas.error) presencas.value = resPresencas.data
    if (!resPresentes.error) presentes.value = resPresentes.data
}

// Alterna presença
const alternarPresenca = async (id, statusAtual) => {
    const { error } = await supabase.from('presencas').update({ vai_comparecer: !statusAtual }).eq('id', id)
    if (!error) buscarDados()
}

// Remove presença
const excluirPresenca = async (id) => {
    if (!confirm('Deseja excluir este registro?')) return
    const { error } = await supabase.from('presencas').delete().eq('id', id)
    if (!error) buscarDados()
}

// Alterna status presente
const alternarStatusPresente = async (id, statusAtual) => {
    const novoStatus = statusAtual === 'pago' ? 'pendente' : 'pago'
    const { error } = await supabase.from('presentes').update({ status: novoStatus }).eq('id', id)
    if (!error) buscarDados()
}

// Remove presente
const excluirPresente = async (id) => {
    if (!confirm('Deseja excluir este registro?')) return
    const { error } = await supabase.from('presentes').delete().eq('id', id)
    if (!error) buscarDados()
}

// Formata data
const formatarData = (isoString) => {
    return new Date(isoString).toLocaleDateString('pt-BR')
}
</script>

<style scoped>
/* Base */
.admin-layout {
    font-family: 'Inter', 'Poppins', sans-serif;
    background-color: #f3f4f6;
    min-height: 100vh;
    color: #1f2937;
}

/* Login */
.login-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
}
.login-card {
    background: #ffffff;
    width: 100%;
    max-width: 400px;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
}
.login-header h2 { font-size: 1.5rem; margin-bottom: 5px; }
.login-header p { color: #6b7280; font-size: 0.9rem; margin-bottom: 25px; }
.input-group { margin-bottom: 20px; text-align: left; }
.input-group label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px; }
.input-group input { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; box-sizing: border-box; }
.btn-primary { width: 100%; background: #111827; color: #fff; padding: 12px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }

/* Topbar */
.topbar {
    background: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    padding: 15px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.topbar-brand h2 { font-size: 1.25rem; }
.topbar-brand span { color: #6b7280; font-weight: 400; margin-left: 5px; }
.topbar-actions { display: flex; align-items: center; gap: 15px; }
.user-email { font-size: 0.9rem; color: #6b7280; display: none; }
@media (min-width: 600px) { .user-email { display: block; } }
.btn-outline { background: transparent; border: 1px solid #d1d5db; padding: 6px 12px; border-radius: 6px; cursor: pointer; }

/* Conteúdo */
.content {
    padding: 40px;
    max-width: 1200px;
    margin: 0 auto;
}
.data-section {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    margin-bottom: 40px;
    padding: 20px;
}
.section-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #e5e7eb;
}
.section-header h3 { font-size: 1.1rem; margin: 0; }
.count-badge { background: #f3f4f6; color: #4b5563; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }

/* Lista Personalizada (Div/Grid) */
.custom-table {
    width: 100%;
}
.t-header {
    display: none; /* Oculto no celular */
    padding: 15px;
    color: #6b7280;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    border-bottom: 1px solid #e5e7eb;
}
.t-row {
    padding: 15px;
    border-bottom: 1px solid #f3f4f6;
    align-items: center;
}
.t-row:hover { background-color: #f9fafb; }
.font-medium { font-weight: 600; }
.text-right { text-align: right; }

/* Controle de Texto Longo no PC */
.msg-cell {
    min-width: 0; /* Previne estouro do Grid */
}
.msg-text {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #6b7280;
}

/* Configuração do Grid para PC */
@media (min-width: 769px) {
    .t-header { display: grid; }
    .t-row { display: grid; }
    /* Proporção das colunas */
    .grid-presencas { grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 15px; }
    .grid-presentes { grid-template-columns: 1.5fr 1fr 2.5fr 1fr 1.5fr; gap: 15px; }
    .actions-cell { justify-content: flex-end; display: flex; }
}

/* Status e Botões */
.status-pill { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
.status-pill.green { background: #d1fae5; color: #065f46; }
.status-pill.red { background: #fee2e2; color: #991b1b; }
.status-pill.yellow { background: #fef3c7; color: #92400e; }

.actions-cell { display: flex; gap: 10px; }
.btn-icon { background: #f3f4f6; border: none; color: #4b5563; padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: 0.2s; }
.btn-icon:hover { background: #e5e7eb; }
.btn-icon.success { background: #10b981; color: #fff; }
.btn-icon.success:hover { background: #059669; }
.btn-icon.danger { color: #dc2626; background: transparent; }
.btn-icon.danger:hover { background: #fee2e2; }

/* Visual de Card no Celular */
@media (max-width: 768px) {
    .content { padding: 15px; }
    .data-section { padding: 15px; }
    
    .t-row {
        display: flex;
        flex-direction: column;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        margin-bottom: 15px;
        padding: 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    
    .t-cell {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 15px;
        border-bottom: 1px solid #f3f4f6;
    }
    
    .t-cell:last-child {
        border-bottom: none;
        background: #f9fafb;
        border-radius: 0 0 12px 12px;
        justify-content: flex-end;
    }

    /* Rótulo dinâmico */
    .t-cell::before {
        content: attr(data-label);
        font-size: 0.8rem;
        font-weight: 600;
        color: #9ca3af;
        text-transform: uppercase;
        margin-right: 15px;
    }
    
    /* Quebra linha no celular se o texto for gigante */
    .msg-cell {
        flex-direction: column;
        align-items: flex-start;
    }
    .msg-cell::before {
        margin-bottom: 5px;
    }
    .msg-text {
        white-space: normal;
        overflow: visible;
        word-break: break-word;
        color: #4b5563;
        font-size: 0.95rem;
    }
}
</style>