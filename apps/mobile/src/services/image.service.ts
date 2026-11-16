import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export interface ImagemOtimizada {
  uri: string;
  name: string;
  type: string;
  width: number;
  height: number;
}

export const imageService = {
  /**
   * Compacta e redimensiona a foto no aparelho do usuário antes de iniciar o upload.
   * Reduz imagens pesadas (10-15MB) para arquivos de ~350KB sem perda visível de qualidade.
   */
  async otimizarFoto(uri: string, larguraMaxima: number = 1440): Promise<ImagemOtimizada> {
    try {
      const resultado = await manipulateAsync(
        uri,
        [{ resize: { width: larguraMaxima } }],
        { compress: 0.82, format: SaveFormat.JPEG }
      );

      const nomeArquivo = `evidencia_${Date.now()}.jpg`;

      return {
        uri: resultado.uri,
        name: nomeArquivo,
        type: 'image/jpeg',
        width: resultado.width,
        height: resultado.height,
      };
    } catch (erro) {
      console.warn('[imageService] Falha na compressão da imagem; utilizando original:', erro);
      return {
        uri,
        name: `evidencia_${Date.now()}.jpg`,
        type: 'image/jpeg',
        width: 1440,
        height: 1080,
      };
    }
  },
};
