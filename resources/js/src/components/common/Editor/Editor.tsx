import { FC } from "react";
import { Editor as EditorComponent } from '@tinymce/tinymce-react';
import { Editor as TinyMCEEditor } from 'tinymce';


export interface EditorProps {
    key?: any;
    height?: number | string;
    width?: number | string;
    value: string;
    maxWidth?: string;
    disabled?: boolean;
    onInit?: (evt: unknown, editor: TinyMCEEditor) => void;
    onEditorChange: (content: string) => void;
}
const Editor: FC<EditorProps> = ({ height = 500, width, value, disabled = false, onInit, onEditorChange, key }) => {

    return (
        <EditorComponent
            key={key}
            apiKey="6sab9e3tdw61j2fvllkoplattrziqsp1m07ac8w41wfy4bms"
            disabled={disabled}
            value={value}
            init={{
                forced_root_block: 'p',
                height,
                width,
                menubar: true,
                plugins: [
                    'advlist autolink lists link image charmap preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table paste help wordcount',
                    'code', 'visualblocks', 'visualchars', 'fullscreen',
                    'emoticons', 'nonbreaking', 'charmap'
                ],
                toolbar:
                    'undo redo | blocks | fontsizeselect | ' +
                    'bold italic underline strikethrough forecolor backcolor | ' +
                    'alignleft aligncenter alignright alignjustify | ' +
                    'bullist numlist outdent indent | removeformat | help | fullscreen',
                fontsize_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',

                block_formats:
                    'Parágrafo=p; ' +
                    'Título 1=h1; ' +
                    'Título 2=h2; ' +
                    'Título 3=h3; ' +
                    'Título 4=h4; ' +
                    'Título 5=h5; ' +
                    'Título 6=h6; ' +
                    'Preformatado=pre; ' +
                    'Código=code',

                // Preserva atributos Word/LibreOffice que carregam alinhamento (align=center)
                // e marcadores de idioma (lang=PT). Sem isso, o TinyMCE os remove ao salvar.
                extended_valid_elements:
                    'p[align|style|class|lang|id],' +
                    'span[lang|style|class|id],' +
                    'div[class|style|id],' +
                    'h1[style|class|lang|align],' +
                    'h2[style|class|lang|align],' +
                    'h3[style|class|lang|align],' +
                    'h4[style|class|lang|align],' +
                    'h5[style|class|lang|align],' +
                    'h6[style|class|lang|align],' +
                    'body[lang|style]',

                // Preserva todas as propriedades CSS para não truncar estilos Word
                valid_styles: {
                    '*': 'font-size,font-family,font-weight,font-style,text-align,text-decoration,' +
                        'color,background-color,margin,margin-top,margin-right,margin-bottom,margin-left,' +
                        'padding,letter-spacing,line-height,position,top,left,width,height,z-index,' +
                        'word-spacing,text-autospace,zoom,transform-origin,overflow,box-sizing,' +
                        'pointer-events,display,vertical-align,border'
                },

                content_style: `
                    body { font-family:Helvetica,Arial,sans-serif; font-size:14px; line-height:1.15; -webkit-font-smoothing:antialiased; }

                    /* --- HTML Word-like (LibreOffice/Word export) ---
                       Alinhamento já está nas classes de bloco (h1, p[align=center]).
                       Não sobrescrevemos: deixamos o CSS original do documento agir. */
                    div[class^="WordSection"] {
                        position: relative !important;
                        overflow: hidden !important;
                        box-sizing: border-box !important;
                    }
                    div[class^="WordSection"] span[style*="z-index:-"] {
                        pointer-events: none !important;
                    }

                    /* --- HTML pdftohtml (div#page1-div) ---
                       Filhos são absolutamente posicionados pelo conversor.
                       Elementos inline (b, i, strong) devem ser estáticos para não quebrar o fluxo. */
                    div[id^="page"][id$="-div"] {
                        position: relative !important;
                        overflow: hidden !important;
                    }
                    div[id^="page"][id$="-div"] > * {
                        position: absolute;
                    }
                    div[id^="page"][id$="-div"] b,
                    div[id^="page"][id$="-div"] i,
                    div[id^="page"][id$="-div"] u,
                    div[id^="page"][id$="-div"] strong,
                    div[id^="page"][id$="-div"] em {
                        position: static !important;
                    }
                    div[id^="page"][id$="-div"] p,
                    div[id^="page"][id$="-div"] span,
                    div[id^="page"][id$="-div"] div {
                        max-width: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        text-align: inherit;
                        color: inherit;
                        letter-spacing: normal !important;
                        word-spacing: normal !important;
                    }

                    /* Reset genérico para parágrafos fora de contêineres de página */
                    p { margin: 0; padding: 0; }
                    p:empty { min-height: 1.2em; }
                    p:empty::before { content: '\\00a0'; }
                `,

                formats: {
                    h1: { block: 'h1', classes: 'custom-h1-class', styles: { 'font-size': '55px', 'padding': '0', 'margin': '0' } },
                    h2: { block: 'h2', classes: 'custom-h2-class', styles: { 'font-size': '45px', 'padding': '0', 'margin': '0' } },
                    h3: { block: 'h3', classes: 'custom-h3-class', styles: { 'font-size': '35px', 'padding': '0', 'margin': '0' } },
                    h4: { block: 'h4', classes: 'custom-h4-class', styles: { 'font-size': '30px', 'padding': '0', 'margin': '0' } },
                    p: { block: 'p', classes: 'custom-p-class' }
                },
            }}
            onEditorChange={onEditorChange}
            onInit={onInit}
        />
    );
};

export default Editor;