import { createContext } from 'react';

// Definindo a interface para o perfil do usuário
interface Role {
    id: number;
    name: string;
}

interface Entity {
    id: number;
    state_id: number;
    business_segment_id?: number | null;
    config: Config
}

// Definindo a interface para o plano do usuário
interface Plan {
    id: number;
    name: string;
    number_of_stores: number;
}

// Definindo a interface para a loja atual do usuário
interface Store {
    id: number;
    name: string;
}

// Definindo a interface para o telefone do usuário
interface Phone {
    phone: string;
}

// Definindo a interface para o contrato ativo do usuário
interface ContractActive {
    plan: Plan;
}

// Definindo a interface para o cliente do usuário
interface Client {
    contract_active: ContractActive;
}

interface MainUser {
    id: number;
}
interface Config {
    main_user: MainUser
}

// Definindo a interface para o usuário
interface User {
    id: number;
    name: string;
    role_id: number;
    role: Role;
    current_store: Store;
    plan_id: number;
    plan: Plan;
    company_id: number | null;
    account?: string;
    selected_store_id: number | null;
    active: boolean;
    phone?: string; // Adicionando telefone
    activation_date?: string; // Data de ativação
    order_count_since_activation?: number; // Contagem de pedidos desde a ativação
    client: Client; // Adicionando cliente com contrato ativo
    entity: Entity,
    is_main_user: boolean;
    is_available_for_upgrade: boolean;
    email_verified_at: string | null;
}

interface Theme {
    id: number;
    logo_base64: string;
    primary_color: string;
    secondary_color: string;
    entity: Entity;
}

// Definindo a interface para o retorno da função `sign`
interface SignResponse {
    data: {
        message: string;
        user: User;
    };
}

// Estado inicial do usuário
const initialStateUser: User = {
    id: 0,
    name: '',
    role_id: 0,
    plan_id: 0,
    account: '',
    selected_store_id: null,
    active: false,
    company_id: null,
    is_main_user: true,
    is_available_for_upgrade: true,
    role: {
        id: 0,
        name: ''
    },
    current_store: {
        id: 0,
        name: ''
    },
    plan: {
        name: '',
        id: 0,  
        number_of_stores: 0,
    },
    phone: '', // Definido inicialmente como vazio
    activation_date: '', // Definido como vazio
    email_verified_at: null,
    order_count_since_activation: 0, // Inicializado como 0
    client: {
        contract_active: {
            plan: {
                id: 0,
                name: '',
                number_of_stores: 0,
            }
        }
    },
    entity: {
        id: 0,
        state_id: 0,
        config: {
            main_user: {
                id: 0
            }
        }
    },
};

const initialStateTheme = {
    id: 0,
    logo_base64: '',
    primary_color: '',
    secondary_color: '',
    entity: {id: 0, state_id: 0}
};

// Definindo o contexto com tipos adequados
const AppContext = createContext<{
    user: User;
    token: string;
    theme: Theme;
    setUserLogged: (user: User) => void;
    sign: (email: string, password: string) => Promise<SignResponse>;
    signOut: () => void;
    setUserToken: (token: string) => void;
    checkRole: (role: string) => boolean;
    applyTheme: (config?: any) => void;
    hasPermission: (role: string) => boolean;
    userIsBlock: () => boolean;
}>({
    user: initialStateUser,
    token: '',
    theme: initialStateTheme,
    setUserLogged: (user: User) => {},
    sign: async (email: string, password: string) => {
        return { 
            data: {
                message: '',
                user: initialStateUser, // Retorna o estado inicial
            }
        };
    },
    signOut: () => {},
    setUserToken: (token: string) => {},
    checkRole: (role: string) => true,
    applyTheme: (config: any) => {},
    hasPermission: () => true,
    userIsBlock: () => true,
});

export default AppContext;
