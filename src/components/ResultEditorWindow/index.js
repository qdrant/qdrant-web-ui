import React, { useState, useRef, useEffect } from "react";

import Editor from "@monaco-editor/react";




const ResultEditorWindow = ({code,onChange}) => {
  const editorRef = useRef(null);
  const defaultValue=`
{  
    "employee": {  
        "name":       "sonoo",   
        "salary":      56000,   
        "married":    true  
    }  
}  

{  
  "employee": {  
      "name":       "sonoo",   
      "salary":      56000,   
      "married":    true  
  }  
}  



{  
  "employee": {  
      "name":       "sonoo",   
      "salary":      56000,   
      "married":    true  
  }  
}  



{  
  "employee": {  
      "name":       "sonoo",   
      "salary":      56000,   
      "married":    true  
  }  
}  
  `
  useEffect(() => {
    editorRef.current?.updateOptions({ readOnly: false})
    editorRef.current?.getAction('editor.action.formatDocument').run().then(() => console.log('finished'));
    editorRef.current?.updateOptions({ readOnly: true})
    console.log("wdhkjdh")
  }, [code]);

  


  return (
    <div >
      <Editor
        height="90vh"
        language={"json"}
        value={code}
        defaultValue={defaultValue}
        onChange={onChange}
        onMount={(editor) => (editorRef.current = editor)}
        options={{readOnly: true,}}
      />
    </div>
  );
};
export default ResultEditorWindow;
