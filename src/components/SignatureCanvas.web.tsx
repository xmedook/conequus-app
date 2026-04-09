import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { View } from 'react-native';
import SignaturePad from 'signature_pad';

interface SignatureCanvasProps {
  onOK?: (signature: string) => void;
  onEmpty?: () => void;
  webStyle?: string;
  style?: any;
}

const SignatureCanvas = forwardRef<any, SignatureCanvasProps>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const padRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // Set canvas size to match its display size
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(ratio, ratio);
      if (padRef.current) padRef.current.clear();
    };

    padRef.current = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(0, 0, 0)',
    });

    padRef.current.addEventListener('endStroke', () => {
      if (padRef.current && !padRef.current.isEmpty()) {
        const dataUrl = padRef.current.toDataURL('image/png');
        props.onOK?.(dataUrl);
      }
    });

    // Wait for layout then resize
    setTimeout(resize, 100);
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      padRef.current?.off();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    clearSignature: () => {
      padRef.current?.clear();
      props.onEmpty?.();
    },
    readSignature: () => {
      if (padRef.current && !padRef.current.isEmpty()) {
        const dataUrl = padRef.current.toDataURL('image/png');
        props.onOK?.(dataUrl);
      } else {
        props.onEmpty?.();
      }
    },
  }));

  return (
    <View style={[{ flex: 1 }, props.style]}>
      {/* @ts-ignore - canvas is valid on web */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          touchAction: 'auto',
          cursor: 'crosshair',
          display: 'block',
        }}
      />
    </View>
  );
});

export default SignatureCanvas;
