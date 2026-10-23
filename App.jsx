import React, { useState } from 'react';
import './App.css'; // 如果有需要可引入樣式

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [targetLang, setTargetLang] = useState('zh-TW');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  // 處理檔案選擇或拍照
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResults([]);
      setError(null);
    }
  };

  // 送出圖片到 Java 後端 API
  const handleUploadAndTranslate = async () => {
    if (!selectedFile) {
      alert('請先選擇或拍攝一張圖片！');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('lang', targetLang);

    try {
      const response = await fetch('https://dashboard.render.com/web/srv-dbdmnetg1s2s73c1f250/deploys/dep-dbdmuda9lscs73canlh0?r=2026-10-23%4014%3A28%3A09%7E2026-10-23%4014%3A33%3A54', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('伺服器處理失敗，狀態碼：' + response.status);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setError('無法連線到 Java 後端，請確認後端已啟動且 IP 設定正確。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>📸 萬能圖片翻譯機</h2>
        <p>拍照或上傳圖片，即時翻譯多國文字</p>
      </header>

      {/* 檔案上傳 / 拍照區 */}
      <div style={styles.uploadCard}>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" // 在手機上會直接開啟相機
          onChange={handleFileChange} 
          style={styles.fileInput}
          id="cameraInput"
        />
        <label htmlFor="cameraInput" style={styles.cameraButton}>
          📁 選擇圖片或使用相機拍照
        </label>

        {previewUrl && (
          <div style={styles.previewContainer}>
            <img src={previewUrl} alt="預覽圖" style={styles.previewImage} />
          </div>
        )}

        {/* 目標語言選擇 */}
        <div style={styles.controlGroup}>
          <label>目標語言：</label>
          <select 
            value={targetLang} 
            onChange={(e) => setTargetLang(e.target.value)}
            style={styles.select}
          >
            <option value="zh-TW">繁體中文</option>
            <option value="en">英文 (English)</option>
            <option value="ja">日文 (日本語)</option>
            <option value="ko">韓文 (한국어)</option>
          </select>
        </div>

        <button 
          onClick={handleUploadAndTranslate} 
          disabled={loading || !selectedFile}
          style={{
            ...styles.submitButton, 
            backgroundColor: loading || !selectedFile ? '#ccc' : '#007BFF'
          }}
        >
          {loading ? 'AI 辨識與翻譯中...' : '開始辨識與翻譯'}
        </button>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {/* 辨識結果顯示區 */}
      <div style={styles.resultSection}>
        <h3>辨識與翻譯結果 ({results.length} 個區塊)</h3>
        {results.length === 0 && !loading && (
          <p style={styles.placeholderText}>尚未進行辨識，請上傳圖片後點擊按鈕。</p>
        )}

        {results.map((item, index) => (
          <div key={index} style={styles.resultCard}>
            <div style={styles.originalText}>
              <strong>原文：</strong> {item.originalText}
            </div>
            <div style={styles.translatedText}>
              <strong>翻譯：</strong> {item.translatedText}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 簡單的內嵌樣式（方便直接複製測試）
const styles = {
  container: { maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh' },
  header: { textAlign: 'center', marginBottom: '20px', color: '#333' },
  uploadCard: { background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' },
  fileInput: { display: 'none' },
  cameraButton: { display: 'block', padding: '12px 20px', backgroundColor: '#6c757d', color: '#fff', borderRadius: '8px', cursor: 'pointer', marginBottom: '15px', fontWeight: 'bold' },
  previewContainer: { margin: '15px 0' },
  previewImage: { maxWidth: '100%', maxHeight: '250px', borderRadius: '8px', objectFit: 'contain' },
  controlGroup: { margin: '15px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' },
  select: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' },
  submitButton: { width: '100%', padding: '12px', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  errorBox: { marginTop: '15px', padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '6px' },
  resultSection: { marginTop: '30px' },
  placeholderText: { color: '#888', textAlign: 'center' },
  resultCard: { background: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' },
  originalText: { color: '#555', marginBottom: '5px' },
  translatedText: { color: '#007BFF', fontSize: '16px', fontWeight: 'bold' }
};

export default App;