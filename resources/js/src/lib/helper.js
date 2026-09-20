import { format, parseISO } from 'date-fns';
import api from './api';


export const formatDate = (isoDateString, format = 'd/m/Y H:i:s') => {
    const date = new Date(isoDateString);

    const pad = (num) => (num < 10 ? '0' + num : '' + num);

    // Mapeamento dos tokens para seus valores usando métodos UTC
    const tokens = {
      d: pad(date.getUTCDate()),            // dia em UTC
      m: pad(date.getUTCMonth() + 1),       // mês em UTC (getMonth() é 0-indexed)
      Y: date.getUTCFullYear(),             // ano em UTC
      H: pad(date.getUTCHours()),           // hora em UTC
      i: pad(date.getUTCMinutes()),         // minuto em UTC
      s: pad(date.getUTCSeconds()),         // segundo em UTC
    };

    // Substitui cada token no formato pela data correspondente
    return format.replace(/d|m|Y|H|i|s/g, (match) => tokens[match]);
};

export const formatSimpleDate = (isoDateString) => {
  // Converte a string de data ISO para um objeto Date, preservando o valor original
  const date = parseISO(isoDateString);

  // Formata a data como dd/MM/yyyy
  return format(date, 'dd/MM/yyyy');
};
  

export const messageErrorAxios = (errors) => {
    let message = '';
    Object.keys(errors).forEach(key => {
        message = message + errors[key] + "\n";
    });
    return message;
}


export const cpfIsValid = (cpf) => {
    let strCPF = cpf.split('.').join("").replace("-", '').split(' ').join('');

    let Soma;
    let Resto;
    Soma = 0;
    if (strCPF === "00000000000") return false;

    for (let i = 1; i <= 9; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    Resto = (Soma * 10) % 11;

    if ((Resto === 10) || (Resto === 11)) Resto = 0;
    if (Resto !== parseInt(strCPF.substring(9, 10))) return false;

    Soma = 0;
    for (let i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    Resto = (Soma * 10) % 11;

    if ((Resto === 10) || (Resto === 11)) Resto = 0;
    return Resto === parseInt(strCPF.substring(10, 11));
}

export function removerUltimaOcorrencia(str, palavra) {
    // Encontre a última ocorrência da palavra
    var lastIndex = str.lastIndexOf(palavra);

    // Se a palavra não for encontrada, retorne a string original
    if (lastIndex === -1) {
        return str;
    }

    // Crie uma nova string sem a última ocorrência da palavra
    var novaString = str.slice(0, lastIndex) + str.slice(lastIndex + palavra.length);

    return novaString;
}

export const colombianMoney = value => {
  return parseFloat(value).toLocaleString("es-co", {
      style: "currency",
      currency: "COP",
  });
}

export const usMoney = value => {
  return parseFloat(value).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
  });
};

export const brazilianMoney = value => {
    return parseFloat(value).toLocaleString("pt-br", {
        style: "currency",
        currency: "BRL",
    });
}

export function brazilianRealToFloat(valorEmReais) {
    // Remove caracteres não numéricos, como "R$", "." (milhar) e "," (decimal)
    valorEmReais = valorEmReais.replace('R$ ', '').replace(/R\$/g, '');

    // Substitui a vírgula decimal por um ponto
    valorEmReais = valorEmReais.replace('.', '');

    valorEmReais = valorEmReais.replace(',', '.');

    return parseFloat(valorEmReais);
}

export const convertPointToComma = value => {
    const money = brazilianMoney(value);
    return money.split(' ')[1];
}

export const clearMask = (document) => {
    if (document)
        return document.split('-').join('').split(' ').join('').split('.').join('').split('_').join('').split('/').join('').split('-').join('').split('(').join('').split(')').join('');

    return '';
}


export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function addMaskCpf(document) {
    let value = document.replace(/\D/g, ''); // Remove qualquer coisa que não seja dígito
    if (value.length > 11) {
      value = value.slice(0, 11); // Limita a 11 dígitos
    }

    // Aplica a máscara de CPF
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    return value;
}

export function addMaskCnpj(document) {
    return document
    .replace(/\D/g, '') // Remove tudo que não é número
    .replace(/^(\d{2})(\d)/, '$1.$2') // Coloca o primeiro ponto
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3') // Coloca o segundo ponto
    .replace(/\.(\d{3})(\d)/, '.$1/$2') // Coloca a barra
    .replace(/(\d{4})(\d)/, '$1-$2') // Coloca o traço
    .slice(0, 18); // Limita ao tamanho máximo do CNPJ
}

export function applyMask(value, mask) {
    const numbers = value.replace(/\D/g, '');
    let masked = '';
    let numberIndex = 0;
  
    for (let i = 0; i < mask.length; i++) {
      if (numberIndex >= numbers.length) break;
  
      if (mask[i] === '9') {
        masked += numbers[numberIndex];
        numberIndex++;
      } else {
        masked += mask[i];
      }
    }
  
    return masked;
}

export const isObjectEmpty = (obj) => {

    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

export const uniquesValuesByKey = (arrayDeObjetos, key) => {

    // Array para armazenar os valores únicos do campo "id"
    var valoresUnicos = [];

    // Objeto auxiliar para rastrear valores únicos
    var valoresUnicosSet = new Set();

    // Loop pelos objetos no array
    for (var i = 0; i < arrayDeObjetos.length; i++) {
        var objeto = arrayDeObjetos[i];
        var valor = objeto[key]; // Selecione o campo desejado, neste caso, "id"

        // Verifique se o valor já existe no conjunto
        if (!valoresUnicosSet.has(valor)) {
            valoresUnicos.push(valor); // Adicione o valor ao array
            valoresUnicosSet.add(valor); // Adicione o valor ao conjunto para evitar duplicatas
        }
    }

    return valoresUnicos;
}

export const uniqueObjectsKeyBased = (arr, coluna) => {
    var chaves = {};
    var resultado = [];

    for (var i = 0; i < arr.length; i++) {
        var objeto = arr[i];
        var chave = objeto[coluna];

        if (!chaves[chave]) {
            resultado.push(objeto);
            chaves[chave] = true;
        }
    }

    return resultado;
}

// Função para somar meses a uma data no formato "YYYY-MM-DD"
function addMonths(data, meses) {
    const partesData = data.split('-');
    const ano = parseInt(partesData[0], 10);
    const mes = parseInt(partesData[1], 10);
    const dia = parseInt(partesData[2], 10);

    const novaData = new Date(ano, mes - 1 + meses, dia);

    // Formatar a data para "d/m/Y"
    const diaFormatado = novaData.getDate().toString().padStart(2, '0');
    const mesFormatado = (novaData.getMonth() + 1).toString().padStart(2, '0');
    const anoFormatado = novaData.getFullYear();

    return `${diaFormatado}/${mesFormatado}/${anoFormatado}`;
}

const today = (dayAdd = 0) => {
    // Obter a data de hoje
    const dataDeHoje = new Date();

    // Adicionar 1 dia
    dataDeHoje.setDate(dataDeHoje.getDate() + dayAdd);

    // Formatar a data para "YYYY-MM-DD"
    const ano = dataDeHoje.getFullYear();
    const mes = (dataDeHoje.getMonth() + 1).toString().padStart(2, '0');
    const dia = dataDeHoje.getDate().toString().padStart(2, '0');

    const dataFormatada = `${ano}-${mes}-${dia}`;

    return dataFormatada;

}


export function saoObjetosIguais(objA, objB) {
    // Verifique se as propriedades do objeto são iguais
    return objA.id === objB.id && objA.nome === objB.nome;
}

export function removerObjetosDuplicados(array) {
    var objetosUnicos = [];

    for (var i = 0; i < array.length; i++) {
        var objetoAtual = array[i];
        var objetoDuplicado = false;

        for (var j = 0; j < objetosUnicos.length; j++) {
            if (saoObjetosIguais(objetoAtual, objetosUnicos[j])) {
                objetoDuplicado = true;
                break;
            }
        }

        if (!objetoDuplicado) {
            objetosUnicos.push(objetoAtual);
        }
    }

    return objetosUnicos;
}

export const isValidDate = (dateString) => {
    // Verifique o formato da data "YYYY-MM-DD" usando uma expressão regular
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return false;
    }

    // Tente criar um objeto de data a partir da string
    const date = new Date(dateString);

    // Verifique se o objeto de data é válido e se a data é a mesma da string original
    return !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === dateString;
}

export const removeDuplicates = (array, key) => {
    const uniqueObject = {};
    const resultArray = [];

    array.forEach(item => {
        const itemValue = item[key];

        if (!uniqueObject[itemValue]) {
            uniqueObject[itemValue] = true;
            resultArray.push(item);
        }
    });

    return resultArray;
}

export const getAge = dateString => {
    const [day, month, year] = dateString.split('/').map(part => parseInt(part, 10));
    const today = new Date();
    const birthDate = new Date(year, month - 1, day);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

export const firstLetterUppercase = word => {
  if (word) {
    return word[0]?.toUpperCase() + word?.substring(1);
  }

  return '';
}


export const getIdBasedInName = (array, name) => {

  return array?.filter(item => item?.name == name)[0]?.id;
}

export const hexToRgb = (hex) => {
    if (!hex) {
        return '';
    }

    hex = hex.replace("#", "");
  
    // Suporta shorthand (#fff)
    if (hex.length === 3) {
      hex = hex.split("").map(c => c + c).join("");
    }
  
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
  
    return `${r}, ${g}, ${b}`;
  }

  export const getAddress = async (zip_code) => {
    let zipCodeFormated = zip_code.replace('-', '');
    const response = await axios.get(`https://viacep.com.br/ws/${zipCodeFormated}/json/`);

    if(!!!response?.data?.erro){
        return {
            neighborhood: response.data.bairro,
            city: response.data.localidade,
            state: response.data.estado,
            street: response.data.logradouro
        };
    }

    return {
        neighborhood: "",
        city: "", 
        state: "", 
        street: ""
    };
}

export const sortByKey = (array, key) => {
    return [...array].sort((a, b) => {
      const valA = (a[key] || '').toString().toLowerCase();
      const valB = (b[key] || '').toString().toLowerCase();
  
      return valA.localeCompare(valB);
    });
  }
  

export const getStates = async () => {
    const response = await api.get(`/states`);
    return response?.data ? sortByKey(response?.data, 'nome') : []
}

export const getCities = async (params) => {
    const response = await api.get(`/cities`, {params});
    return response?.data ? sortByKey(response?.data, 'nome') : []
}

export const getGenders = async (params) => {
    const response = await api.get(`/genders`, {params});
    return response?.data ?? [];
}


export const isPublicEmail = email => {
  const publicDomains = [
    'gmail.com',
    'hotmail.com',
    'outlook.com',
    'yahoo.com',
    'live.com',
    'icloud.com',
    'aol.com',
    'protonmail.com',
    'zoho.com',
    'gmx.com',
    'mail.com',
    'yandex.com', // Yandex Mail (Russia, but international presence)
    'tutanota.com', // Privacy-focused
    'inbox.com',
    'fastmail.com', // Paid, but widely used
    'operamail.com', // Associated with Opera browser

    // Brazilian Providers (common ones)
    'bol.com.br',
    'uol.com.br',
    'terra.com.br',
    'ig.com.br',
    'zipmail.com.br',
    'oi.com.br',
    'globomail.com',
    'r7.com',

    // Other common international domains often seen
    'outlook.sa', // Saudi Arabia (example of country-specific TLDs)
    'yahoo.co.uk',
    'yahoo.fr',
    'yahoo.de',
    'hotmail.co.uk',
    'live.co.uk',
    'googlemail.com', // Alias for Gmail
    'mail.ru', // Popular in Russia
    'list.ru', // Associated with Mail.ru
    'bk.ru',   // Associated with Mail.ru
    'internet.ru', // Associated with Mail.ru
    'rambler.ru', // Another Russian provider
    'ukr.net', // Ukrainian provider
    'bigpond.com', // Australian (Telstra)
    'btinternet.com', // UK (BT)
    'virginmedia.com', // UK (Virgin Media)
    'ntlworld.com', // UK (part of Virgin Media)
    'sbcglobal.net', // AT&T legacy
    'att.net', // AT&T
    'verizon.net', // Verizon legacy
    'comcast.net', // Xfinity/Comcast
    'charter.net', // Spectrum/Charter
    'cox.net', // Cox Communications
    'optimum.net', // Cablevision/Optimum
    'earthlink.net', // EarthLink
    'juno.com', // Dial-up ISP
    'netzero.net', // Dial-up ISP
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  return publicDomains.includes(domain);
}

export const sortOptions = (a, b, input) => {
  const inputLower = input.toLowerCase();
  const aStarts = a.label.toLowerCase().startsWith(inputLower);
  const bStarts = b.label.toLowerCase().startsWith(inputLower);

  if (aStarts && !bStarts) return -1;
  if (!aStarts && bStarts) return 1;
  return 0; // mantém ordem se ambos ou nenhum começar
};

export const convertCentToReal = (value) => {
    return (value / 100)?.toFixed(2).replace('.', ',');
}

export const isValidDocument = (valor) => {
    const texto = valor.replace(/[^\d]+/g, '');

    if (texto.length === 11) {
        return validarCPF(texto);
    } else if (texto.length === 14) {
        return validarCNPJ(texto);
    } else {
        return false;
    }

    function validarCPF(cpf) {
        if (/^(\d)\1{10}$/.test(cpf)) return false;

        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let resto = 11 - (soma % 11);
        let digito1 = resto >= 10 ? 0 : resto;

        if (parseInt(cpf.charAt(9)) !== digito1) return false;

        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpf.charAt(i)) * (11 - i);
        }
        resto = 11 - (soma % 11);
        let digito2 = resto >= 10 ? 0 : resto;

        return parseInt(cpf.charAt(10)) === digito2;
    }

    function validarCNPJ(cnpj) {
        if (/^(\d)\1{13}$/.test(cnpj)) return false;

        const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        let soma = 0;
        for (let i = 0; i < 12; i++) {
            soma += parseInt(cnpj.charAt(i)) * pesos1[i];
        }
        let resto = soma % 11;
        let digito1 = resto < 2 ? 0 : 11 - resto;

        if (parseInt(cnpj.charAt(12)) !== digito1) return false;

        soma = 0;
        for (let i = 0; i < 13; i++) {
            soma += parseInt(cnpj.charAt(i)) * pesos2[i];
        }
        resto = soma % 11;
        let digito2 = resto < 2 ? 0 : 11 - resto;

        return parseInt(cnpj.charAt(13)) === digito2;
    }
}

export const changePointToComma = number => {
    return number.toString().split('.').join(',');
}

export const optimizeImage = (file, maxWidth, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Redimensiona a imagem apenas se a largura for maior que o maxWidth
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                // Determina o tipo de imagem e a qualidade
                const imageType = canvas.toDataURL('image/webp').startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg';
                const optimizedBase64 = canvas.toDataURL(imageType, quality);
                
                resolve(optimizedBase64);
            };
            img.onerror = () => {
                reject(new Error("Erro ao carregar a imagem."));
            };
            img.src = event.target?.result;
        };
        reader.onerror = () => {
            reject(new Error("Erro ao ler o arquivo."));
        };
        reader.readAsDataURL(file);
    });
};