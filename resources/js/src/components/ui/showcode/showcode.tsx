import React, { useRef, useState } from 'react';

const Showcode = ({ title,code,children, customCardClass, customCardHeaderClass, customCardBodyClass, customCardFooterClass }:any) => {

  const [showCode, setShowCode] = useState(false);
  const randomValueRef:any = useRef(`reference${Math.ceil(Math.random() * 999)}`);

  const toggleCode = () => {
    setShowCode(!showCode);
  };

  return (
    <div className={`card custom-card ${customCardClass}`}>
      <div className={`card-header justify-content-between ${customCardHeaderClass}`}>
        <div className="card-title" dangerouslySetInnerHTML={{ __html: title }}></div>
        <div className="prism-toggle">
          <button type="button" className="btn btn-sm btn-primary-light"  onClick={toggleCode}>Show
                                    Code  <i className={`${showCode ? 'ri-code-s-slash-line' : 'ri-code-line'} ms-2 align-middle inline-block`}></i></button>
        </div>
      </div>
      <div ref={randomValueRef} className={`card-body ${customCardBodyClass}`} style={{ display: showCode ? 'none' : 'block' }}>
        {React.Children.map(children, child => React.cloneElement(child))}
      </div>
      <div className={`card-footer border-top-0 ${customCardFooterClass}`} style={{ display: showCode ? 'block' : 'none' }}>
        <pre className="language-html">
          <code className="language-html" >{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default Showcode;



