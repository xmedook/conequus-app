import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import SignatureCanvas from '../components/SignatureCanvas';
import * as Print from 'expo-print';
import { useStore } from '../store';
import { supabase } from '../lib/supabase';

const PRIMARY = '#0D9488';

interface Props {
  navigation: any;
  route: any;
}

export default function FirmaScreen({ navigation, route }: Props) {
  const { sesionId } = route.params;
  const sesion = useStore((s) => s.getSesionById(sesionId));
  const cliente = useStore((s) => (sesion ? s.getClienteById(sesion.clienteId) : undefined));
  const updateSesionFirma = useStore((s) => s.updateSesionFirma);
  const actualizarSesion = useStore((s) => s.actualizarSesion);

  const sigRef = useRef<any>(null);
  const [firmaBase64, setFirmaBase64] = useState<string | null>(null);
  const [generando, setGenerando] = useState(false);

  const cartaResponsiva = `
    <h2 style="color: #0D9488; text-align: center;">Carta Responsiva</h2>
    <h3 style="text-align: center;">Sesión de Coaching Ecuestre</h3>
    <p><strong>Nombre del jinete:</strong> ${cliente?.nombre ?? '—'}</p>
    <p><strong>Caballo:</strong> ${cliente?.caballo ?? '—'}</p>
    <p><strong>Tipo de sesión:</strong> ${sesion?.tipoSesion ?? '—'}</p>
    <p><strong>Modalidad:</strong> ${sesion?.modalidad ?? '—'}</p>
    <p><strong>Fecha:</strong> ${sesion?.fecha ?? '—'} ${sesion?.hora ?? ''}</p>
    <br/>
    <p>Yo, <strong>${cliente?.nombre ?? '___'}</strong>, en pleno uso de mis facultades, 
    declaro haber recibido información completa sobre los riesgos inherentes a la práctica 
    de la equitación y el coaching ecuestre. Me comprometo a seguir las instrucciones del 
    coach en todo momento y acepto la responsabilidad de mi participación.</p>
    <br/>
    <p>Asimismo, exonero a <strong>Conequus Coaching Ecuestre</strong> y a sus instructores 
    de cualquier responsabilidad derivada de accidentes o lesiones que pudieran ocurrir 
    durante la sesión, siempre que se actúe conforme a los protocolos de seguridad establecidos.</p>
    <br/>
    <p>Confirmo que estoy en buen estado de salud para participar en esta actividad.</p>
  `;

  const handleOK = (signature: string) => {
    setFirmaBase64(signature);
  };

  const handleClear = () => {
    sigRef.current?.clearSignature();
    setFirmaBase64(null);
  };

  const handleConfirmar = async () => {
    if (!firmaBase64) {
      Alert.alert('Firma requerida', 'Por favor firma la carta antes de confirmar.');
      return;
    }

    setGenerando(true);
    try {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; color: #1E293B; }
              h2, h3 { margin-bottom: 8px; }
              p { line-height: 1.6; margin-bottom: 8px; }
              .firma-container { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
              .firma-img { max-width: 300px; border: 1px solid #E2E8F0; }
            </style>
          </head>
          <body>
            ${cartaResponsiva}
            <div class="firma-container">
              <p><strong>Firma del jinete:</strong></p>
              <img src="${firmaBase64}" class="firma-img" />
              <p style="margin-top: 20px; color: #64748B; font-size: 12px;">
                Firmado digitalmente el ${new Date().toLocaleDateString('es-MX')} a las ${new Date().toLocaleTimeString('es-MX')}
              </p>
            </div>
          </body>
        </html>
      `;

      // expo-print not available on web; only generate PDF on native
      let pdfUri: string | undefined;
      if (Platform.OS !== 'web') {
        const result = await Print.printToFileAsync({ html });
        pdfUri = result.uri;
      }

      // Upload signature to Supabase Storage
      let firmaUrl: string | undefined;
      try {
        const blob = await fetch(firmaBase64).then((r) => r.blob());
        const fileName = `firma-${sesionId}-${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage
          .from('firmas')
          .upload(fileName, blob, { contentType: 'image/png', upsert: true });
        if (!uploadError) {
          firmaUrl = supabase.storage.from('firmas').getPublicUrl(fileName).data.publicUrl;
        } else {
          console.warn('Storage upload error:', uploadError.message);
        }
      } catch (storageErr) {
        console.warn('Storage upload failed:', storageErr);
      }

      // Update sesion in Supabase with firma_url and estado
      await actualizarSesion(sesionId, {
        firma_url: firmaUrl ?? firmaBase64,
        carta_responsiva_estado: 'firmada',
        ...(pdfUri ? { carta_responsiva_url: pdfUri } : {}),
      });

      updateSesionFirma(sesionId, firmaBase64, pdfUri ?? '');

      Alert.alert(
        '✅ Carta firmada',
        Platform.OS === 'web'
          ? 'La sesión ha sido marcada como Firmada.'
          : 'La sesión ha sido marcada como Firmada y el PDF fue generado.',
        [{ text: 'Aceptar', onPress: () => navigation.goBack() }]
      );
    } catch {
      Alert.alert('Error', 'No se pudo completar la firma. Intenta de nuevo.');
    } finally {
      setGenerando(false);
    }
  };

  if (!sesion) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 60, color: '#94A3B8' }}>
          Sesión no encontrada
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Carta responsiva — scrollable, fixed max height */}
      <ScrollView
        style={styles.cartaScroll}
        contentContainerStyle={styles.cartaContent}
        showsVerticalScrollIndicator
      >
        <View style={styles.carta}>
          <Text style={styles.cartaTitulo}>Carta Responsiva</Text>
          <Text style={styles.cartaSubtitulo}>Sesión de Coaching Ecuestre</Text>

          <View style={styles.cartaRow}>
            <Text style={styles.cartaLabel}>Jinete:</Text>
            <Text style={styles.cartaValue}>{cliente?.nombre}</Text>
          </View>
          <View style={styles.cartaRow}>
            <Text style={styles.cartaLabel}>Caballo:</Text>
            <Text style={styles.cartaValue}>{cliente?.caballo}</Text>
          </View>
          <View style={styles.cartaRow}>
            <Text style={styles.cartaLabel}>Sesión:</Text>
            <Text style={styles.cartaValue}>{sesion.tipoSesion}</Text>
          </View>
          <View style={styles.cartaRow}>
            <Text style={styles.cartaLabel}>Fecha:</Text>
            <Text style={styles.cartaValue}>
              {sesion.fecha} {sesion.hora}
            </Text>
          </View>

          <Text style={styles.cartaTexto}>
            Declaro haber recibido información completa sobre los riesgos inherentes a la
            práctica de la equitación y el coaching ecuestre. Me comprometo a seguir las
            instrucciones del coach en todo momento y acepto la responsabilidad de mi
            participación.{'\n\n'}
            Exonero a{' '}
            <Text style={{ fontWeight: '700' }}>Conequus Coaching Ecuestre</Text> de cualquier
            responsabilidad derivada de accidentes durante la sesión, conforme a los protocolos
            de seguridad establecidos.
          </Text>
        </View>
      </ScrollView>

      {/* Signature canvas — fills remaining space */}
      <View style={styles.signatureSection}>
        <Text style={styles.sectionLabel}>
          {firmaBase64 ? '✅ Firma capturada' : 'Dibuja tu firma abajo'}
        </Text>
        <View style={styles.signatureContainer}>
          <SignatureCanvas
            ref={sigRef}
            onOK={handleOK}
            onEmpty={() => setFirmaBase64(null)}
            webStyle={`.m-signature-pad { box-shadow: none; border: none; } .m-signature-pad--body { border: none; } .m-signature-pad--footer .button { background-color: ${PRIMARY}; }`}
            style={styles.signature}
          />
        </View>
      </View>

      {/* Buttons — always visible at bottom */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.btnLimpiar}
          onPress={handleClear}
          disabled={generando}
        >
          <Text style={styles.btnLimpiarText}>🗑 Limpiar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnConfirmar, (!firmaBase64 || generando) && styles.btnDisabled]}
          onPress={handleConfirmar}
          disabled={!firmaBase64 || generando}
        >
          {generando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnConfirmarText}>✅ Confirmar</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Carta section — max height so canvas is always visible
  cartaScroll: { maxHeight: 220, flexGrow: 0 },
  cartaContent: { padding: 16 },
  carta: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cartaTitulo: { fontSize: 16, fontWeight: '800', color: PRIMARY, textAlign: 'center' },
  cartaSubtitulo: { fontSize: 12, color: '#64748B', textAlign: 'center', marginBottom: 12 },
  cartaRow: { flexDirection: 'row', marginBottom: 4 },
  cartaLabel: { fontSize: 12, color: '#64748B', width: 65 },
  cartaValue: { fontSize: 12, color: '#1E293B', fontWeight: '600', flex: 1 },
  cartaTexto: { fontSize: 12, color: '#475569', lineHeight: 18, marginTop: 10 },

  // Signature section — fills remaining space between carta and buttons
  signatureSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
    textAlign: 'center',
  },
  signatureContainer: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  signature: { flex: 1 },

  // Bottom bar — always visible, never scrolled away
  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  btnLimpiar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  btnLimpiarText: { color: '#64748B', fontWeight: '600' },
  btnConfirmar: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    alignItems: 'center',
  },
  btnConfirmarText: { color: '#fff', fontWeight: '700' },
  btnDisabled: { opacity: 0.5 },
});
