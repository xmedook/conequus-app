import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SignatureCanvas from '../components/SignatureCanvas';
import * as Print from 'expo-print';
import { useStore } from '../store';
import { supabase } from '../lib/supabase';
import { isWeb, getMaxContentWidth } from '../utils/responsive';

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

  const { width } = useWindowDimensions();
  const isDesktopView = isWeb && width >= 768;
  const maxWidth = getMaxContentWidth();

  const sigRef = useRef<any>(null);
  const [firmaBase64, setFirmaBase64] = useState<string | null>(null);
  const [generando, setGenerando] = useState(false);

  const cartaResponsiva = `
    <h2 style="color: #007AFF; text-align: center; margin-bottom: 8px;">Carta Responsiva</h2>
    <h3 style="text-align: center; color: #8E8E93; margin-bottom: 24px; font-weight: 400;">Sesión de Coaching Ecuestre</h3>

    <div style="background-color: #F9F9F9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #8E8E93;"><strong>Nombre del jinete:</strong></td><td style="padding: 8px 0; text-align: right;"><strong>${cliente?.nombre ?? '--'}</strong></td></tr>
        <tr><td style="padding: 8px 0; color: #8E8E93;"><strong>Tipo de sesión:</strong></td><td style="padding: 8px 0; text-align: right;">${sesion?.tipoSesion ?? '--'}</td></tr>
        <tr><td style="padding: 8px 0; color: #8E8E93;"><strong>Modalidad:</strong></td><td style="padding: 8px 0; text-align: right;">${sesion?.modalidad ?? '--'}</td></tr>
        <tr><td style="padding: 8px 0; color: #8E8E93;"><strong>Fecha:</strong></td><td style="padding: 8px 0; text-align: right;">${sesion?.fecha ?? '--'} ${sesion?.hora ?? ''}</td></tr>
      </table>
    </div>

    <p style="line-height: 1.8; margin-bottom: 16px; text-align: justify;">
      Yo, <strong>${cliente?.nombre ?? '___'}</strong>, en pleno uso de mis facultades,
      declaro haber recibido información completa sobre los riesgos inherentes a la práctica
      de la equitación y el coaching ecuestre. Me comprometo a seguir las instrucciones del
      coach en todo momento y acepto la responsabilidad de mi participación.
    </p>

    <p style="line-height: 1.8; margin-bottom: 16px; text-align: justify;">
      Asimismo, exonero a <strong>Conequus Coaching Ecuestre</strong> y a sus instructores
      de cualquier responsabilidad derivada de accidentes o lesiones que pudieran ocurrir
      durante la sesión, siempre que se actúe conforme a los protocolos de seguridad establecidos.
    </p>

    <p style="line-height: 1.8; margin-bottom: 24px; text-align: justify;">
      Confirmo que estoy en buen estado de salud para participar en esta actividad y que he
      informado al coach de cualquier condición médica relevante.
    </p>
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
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
                padding: 60px 80px;
                color: #1C1C1E;
                max-width: 800px;
                margin: 0 auto;
              }
              h2 { margin-bottom: 8px; }
              h3 { margin-top: 0; margin-bottom: 24px; }
              p { line-height: 1.8; margin-bottom: 16px; }
              table { width: 100%; border-collapse: collapse; }
              .firma-container {
                margin-top: 60px;
                border-top: 2px solid #E5E5EA;
                padding-top: 30px;
              }
              .firma-img {
                max-width: 400px;
                height: auto;
                border: 1px solid #E5E5EA;
                padding: 10px;
                border-radius: 4px;
                background: white;
              }
              .firma-label {
                font-weight: 600;
                margin-bottom: 12px;
                color: #1C1C1E;
              }
              .timestamp {
                margin-top: 24px;
                color: #8E8E93;
                font-size: 13px;
                font-style: italic;
              }
            </style>
          </head>
          <body>
            ${cartaResponsiva}
            <div class="firma-container">
              <p class="firma-label">Firma del jinete:</p>
              <img src="${firmaBase64}" class="firma-img" alt="Firma" />
              <p class="timestamp">
                Firmado digitalmente el ${new Date().toLocaleDateString('es-MX', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} a las ${new Date().toLocaleTimeString('es-MX', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </body>
        </html>
      `;

      let pdfUri: string | undefined;
      if (Platform.OS !== 'web') {
        const result = await Print.printToFileAsync({ html });
        pdfUri = result.uri;
      }

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

      await actualizarSesion(sesionId, {
        firma_url: firmaUrl ?? firmaBase64,
        carta_responsiva_estado: 'firmada',
        ...(pdfUri ? { carta_responsiva_url: pdfUri } : {}),
      });

      updateSesionFirma(sesionId, firmaBase64, pdfUri ?? '');

      const detalles = `Cliente: ${cliente?.nombre}\nTipo: ${sesion.tipoSesion}\nModalidad: ${sesion.modalidad}\nFecha: ${sesion.fecha} ${sesion.hora}\n\n${
        Platform.OS === 'web'
          ? 'Firma guardada exitosamente.'
          : 'Firma guardada y PDF generado.'
      }`;

      Alert.alert('Carta Responsiva firmada exitosamente', detalles, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert(
        'Error al firmar',
        `No se pudo completar la firma de la carta responsiva.\n\nDetalle: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        [{ text: 'Cerrar' }]
      );
    } finally {
      setGenerando(false);
    }
  };

  if (!sesion) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFound}>Sesión no encontrada</Text>
      </SafeAreaView>
    );
  }

  const renderScrollContent = () => (
    <>
      {/* Carta responsiva */}
      <View style={styles.cartaSection}>
        <View style={styles.carta}>
          <Text style={styles.cartaTitulo}>Carta Responsiva</Text>
          <Text style={styles.cartaSubtitulo}>Sesión de Coaching Ecuestre</Text>

          <View style={styles.infoCard}>
            <View style={styles.cartaRow}>
              <Text style={styles.cartaLabel}>Jinete</Text>
              <Text style={styles.cartaValue}>{cliente?.nombre}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.cartaRow}>
              <Text style={styles.cartaLabel}>Tipo de sesión</Text>
              <Text style={styles.cartaValue}>{sesion.tipoSesion}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.cartaRow}>
              <Text style={styles.cartaLabel}>Modalidad</Text>
              <Text style={styles.cartaValue}>{sesion.modalidad}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.cartaRow}>
              <Text style={styles.cartaLabel}>Fecha y hora</Text>
              <Text style={styles.cartaValue}>
                {sesion.fecha} {sesion.hora}
              </Text>
            </View>
          </View>

          <Text style={styles.cartaTextoTitulo}>Declaración de Responsabilidad</Text>
          <Text style={styles.cartaTexto}>
            Yo, <Text style={styles.bold}>{cliente?.nombre}</Text>, en pleno uso de mis facultades,
            declaro haber recibido información completa sobre los riesgos inherentes a la
            práctica de la equitación y el coaching ecuestre. Me comprometo a seguir las
            instrucciones del coach en todo momento y acepto la responsabilidad de mi
            participación.
          </Text>

          <Text style={styles.cartaTexto}>
            Asimismo, exonero a <Text style={styles.bold}>Conequus Coaching Ecuestre</Text> y a sus instructores
            de cualquier responsabilidad derivada de accidentes o lesiones que pudieran ocurrir
            durante la sesión, siempre que se actúe conforme a los protocolos de seguridad establecidos.
          </Text>

          <Text style={styles.cartaTexto}>
            Confirmo que estoy en buen estado de salud para participar en esta actividad y que he
            informado al coach de cualquier condición médica relevante.
          </Text>
        </View>
      </View>

      {/* Signature */}
      <View style={styles.signatureSection}>
        <Text style={styles.sectionLabel}>
          {firmaBase64 ? 'FIRMA CAPTURADA' : 'DIBUJA TU FIRMA AQUÍ'}
        </Text>
        <View style={[
          styles.signatureContainer,
          isDesktopView && styles.signatureContainerDesktop
        ]}>
          <SignatureCanvas
            ref={sigRef}
            onOK={handleOK}
            onEmpty={() => setFirmaBase64(null)}
            webStyle={`.m-signature-pad { box-shadow: none; border: none; } .m-signature-pad--body { border: none; } .m-signature-pad--footer .button { background-color: #007AFF; color: white; border-radius: 8px; }`}
            style={styles.signature}
          />
        </View>
        {firmaBase64 && (
          <Text style={styles.firmaOk}>✓ Firma capturada correctamente</Text>
        )}
      </View>
    </>
  );

  const renderBottomBar = () => (
    <View style={styles.bottomBar}>
      <TouchableOpacity
        style={styles.btnLimpiar}
        onPress={handleClear}
        disabled={generando}
        activeOpacity={0.7}
      >
        <Text style={styles.btnLimpiarText}>Limpiar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btnConfirmar, (!firmaBase64 || generando) && styles.btnDisabled]}
        onPress={handleConfirmar}
        disabled={!firmaBase64 || generando}
        activeOpacity={0.7}
      >
        {generando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnConfirmarText}>Confirmar y Firmar</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  if (Platform.OS === 'web') {
    // @ts-ignore - Using native div for better web scroll
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#F2F2F7',
        overflow: 'hidden'
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          <div style={{
            maxWidth: isDesktopView ? maxWidth : '100%',
            width: '100%',
            margin: '0 auto',
            height: '100%',
            overflowY: 'auto',
            paddingBottom: 20
          }}>
            {renderScrollContent()}
          </div>
        </div>
        <div style={{
          maxWidth: isDesktopView ? maxWidth : '100%',
          width: '100%',
          margin: '0 auto'
        }}>
          {renderBottomBar()}
        </div>
      </div>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {renderScrollContent()}
      </ScrollView>
      <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea}>
        {renderBottomBar()}
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  bottomSafeArea: { backgroundColor: '#F2F2F7' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  notFound: { textAlign: 'center', marginTop: 60, color: '#8E8E93', fontSize: 17 },

  // Carta
  cartaSection: { paddingHorizontal: 20, paddingTop: 20 },
  carta: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cartaTitulo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  cartaSubtitulo: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  cartaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  cartaLabel: {
    fontSize: 15,
    color: '#8E8E93',
    flex: 1,
  },
  cartaValue: {
    fontSize: 15,
    color: '#000',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#D1D1D6',
  },
  cartaTextoTitulo: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  cartaTexto: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'justify',
  },
  bold: { fontWeight: '600' },

  // Signature
  signatureSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6D6D72',
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  signatureContainer: {
    height: 200,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 10,
    borderStyle: 'dashed',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  signatureContainerDesktop: {
    height: 300,
  },
  signature: { flex: 1 },
  firmaOk: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 20,
    backgroundColor: '#F2F2F7',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C6C6C8',
  },
  btnLimpiar: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  btnLimpiarText: { color: '#FF3B30', fontWeight: '600', fontSize: 17 },
  btnConfirmar: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnConfirmarText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  btnDisabled: { opacity: 0.4 },
});
