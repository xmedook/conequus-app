import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import SignatureCanvasLib from 'react-native-signature-canvas';

interface SignatureCanvasProps {
  onOK?: (signature: string) => void;
  onEmpty?: () => void;
  webStyle?: string;
  style?: any;
}

const SignatureCanvas = forwardRef<any, SignatureCanvasProps>((props, ref) => {
  const sigRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    clearSignature: () => {
      sigRef.current?.clearSignature();
    },
    readSignature: () => {
      sigRef.current?.readSignature();
    },
  }));

  return (
    <SignatureCanvasLib
      ref={sigRef}
      onOK={props.onOK}
      onEmpty={props.onEmpty}
      webStyle={props.webStyle}
      style={props.style}
      descriptionText=""
      clearText="Limpiar"
      confirmText="Confirmar firma"
    />
  );
});

export default SignatureCanvas;
