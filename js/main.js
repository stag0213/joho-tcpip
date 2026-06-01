// ===================================
// ナビゲーションのスクロール制御
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    // スムーススクロール
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // アクティブクラスの切り替え
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // スクロール先のセクションへ移動
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // ナビゲーションの高さを考慮
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // スクロール位置に応じてナビゲーションをハイライト
    window.addEventListener('scroll', function() {
        let current = '';
        const sections = document.querySelectorAll('.section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
});

// ===================================
// データフローアニメーション
// ===================================

// グローバル変数
let animationInProgress = false;
let currentAnimationTimeout = null;

// ボタン要素の取得
const startEncapsulationBtn = document.getElementById('startEncapsulation');
const startDecapsulationBtn = document.getElementById('startDecapsulation');
const resetAnimationBtn = document.getElementById('resetAnimation');

// イベントリスナーの設定
if (startEncapsulationBtn) {
    startEncapsulationBtn.addEventListener('click', startEncapsulation);
}

if (startDecapsulationBtn) {
    startDecapsulationBtn.addEventListener('click', startDecapsulation);
}

if (resetAnimationBtn) {
    resetAnimationBtn.addEventListener('click', resetAnimation);
}

// カプセル化アニメーション（送信プロセス）
function startEncapsulation() {
    if (animationInProgress) return;
    
    animationInProgress = true;
    resetAnimation();
    
    // フロー方向の表示を更新
    const flowDirection = document.getElementById('flowDirection');
    if (flowDirection) {
        flowDirection.textContent = '送信プロセス - カプセル化（ヘッダーの追加）';
        flowDirection.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        flowDirection.style.color = '#ffffff';
    }

    // 情報ボックスの初期化
    updateInfoBox('カプセル化プロセスを開始します...');

    // アプリケーション層から順番に処理
    setTimeout(() => {
        animateLayer('layer4', 'アプリケーションデータを作成', ['data-segment']);
    }, 500);

    setTimeout(() => {
        animateLayer('layer3', 'TCPヘッダーを追加（ポート番号、シーケンス番号）', ['tcp-header', 'data-segment']);
    }, 2000);

    setTimeout(() => {
        animateLayer('layer2', 'IPヘッダーを追加（送信元・宛先IPアドレス）', ['ip-header', 'tcp-header', 'data-segment']);
    }, 3500);

    setTimeout(() => {
        animateLayer('layer1', 'Ethernetヘッダー・FCSを追加（MACアドレス）', ['ethernet-header', 'ip-header', 'tcp-header', 'data-segment', 'ethernet-trailer']);
    }, 5000);

    setTimeout(() => {
        updateInfoBox('✅ カプセル化完了！データはフレームとして物理ネットワークに送信されます。各階層でヘッダーが追加され、データが保護されています。');
        animationInProgress = false;
    }, 6500);
}

// デカプセル化アニメーション（受信プロセス）
function startDecapsulation() {
    if (animationInProgress) return;
    
    animationInProgress = true;
    resetAnimation();
    
    // フロー方向の表示を更新
    const flowDirection = document.getElementById('flowDirection');
    if (flowDirection) {
        flowDirection.textContent = '受信プロセス - デカプセル化（ヘッダーの除去）';
        flowDirection.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
        flowDirection.style.color = '#ffffff';
    }

    // 情報ボックスの初期化
    updateInfoBox('デカプセル化プロセスを開始します...');

    // 全パケットセグメントを表示
    setTimeout(() => {
        const allSegments = document.querySelectorAll('.packet-segment');
        allSegments.forEach(segment => {
            segment.classList.add('show');
        });
    }, 300);

    // ネットワークインターフェース層から順番に処理
    setTimeout(() => {
        animateLayerDecapsulation('layer1', 'Ethernetヘッダー・FCSを除去・検証', ['ip-header', 'tcp-header', 'data-segment']);
    }, 1500);

    setTimeout(() => {
        animateLayerDecapsulation('layer2', 'IPヘッダーを除去・検証（宛先IPアドレス確認）', ['tcp-header', 'data-segment']);
    }, 3000);

    setTimeout(() => {
        animateLayerDecapsulation('layer3', 'TCPヘッダーを除去・検証（ポート番号確認）', ['data-segment']);
    }, 4500);

    setTimeout(() => {
        animateLayerDecapsulation('layer4', 'アプリケーションデータを取り出し', ['data-segment']);
    }, 6000);

    setTimeout(() => {
        updateInfoBox('✅ デカプセル化完了！元のアプリケーションデータがアプリケーション層に届きました。各階層でヘッダーが除去され、データが正しく抽出されました。');
        animationInProgress = false;
    }, 7500);
}

// 階層をアニメーション表示（カプセル化用）
function animateLayer(layerId, processText, segmentsToShow) {
    // 階層ボックスをアクティブ化
    const layerBox = document.getElementById(`${layerId}-box`);
    if (layerBox) {
        // 全階層を一旦非アクティブ化
        document.querySelectorAll('.layer-box').forEach(box => {
            box.classList.remove('active');
        });
        layerBox.classList.add('active');
    }

    // 処理内容を表示
    const processElement = document.getElementById(`${layerId}-process`);
    if (processElement) {
        processElement.textContent = processText;
    }

    // パケットセグメントを表示
    const packetContainer = document.getElementById(`packet-${layerId}`);
    if (packetContainer) {
        const segments = packetContainer.querySelectorAll('.packet-segment');
        
        // 一旦全てを非表示
        segments.forEach(seg => {
            seg.classList.remove('show');
        });

        // 指定されたセグメントのみ順番に表示
        segmentsToShow.forEach((className, index) => {
            setTimeout(() => {
                const segment = packetContainer.querySelector(`.${className}`);
                if (segment) {
                    segment.classList.add('show');
                }
            }, index * 200);
        });
    }

    // 情報ボックスを更新
    updateInfoBox(`🔄 ${processText}`);
}

// 階層をアニメーション表示（デカプセル化用）
function animateLayerDecapsulation(layerId, processText, remainingSegments) {
    // 階層ボックスをアクティブ化
    const layerBox = document.getElementById(`${layerId}-box`);
    if (layerBox) {
        // 全階層を一旦非アクティブ化
        document.querySelectorAll('.layer-box').forEach(box => {
            box.classList.remove('active');
        });
        layerBox.classList.add('active');
    }

    // 処理内容を表示
    const processElement = document.getElementById(`${layerId}-process`);
    if (processElement) {
        processElement.textContent = processText;
    }

    // 次の階層のパケット表示を更新
    const nextLayerId = getNextLayerId(layerId);
    if (nextLayerId) {
        const nextPacketContainer = document.getElementById(`packet-${nextLayerId}`);
        if (nextPacketContainer) {
            const segments = nextPacketContainer.querySelectorAll('.packet-segment');
            
            // 一旦全てを非表示
            segments.forEach(seg => {
                seg.classList.remove('show');
            });

            // 残るセグメントのみ表示
            setTimeout(() => {
                remainingSegments.forEach((className, index) => {
                    setTimeout(() => {
                        const segment = nextPacketContainer.querySelector(`.${className}`);
                        if (segment) {
                            segment.classList.add('show');
                        }
                    }, index * 200);
                });
            }, 300);
        }
    }

    // 情報ボックスを更新
    updateInfoBox(`🔄 ${processText}`);
}

// 次の階層IDを取得（デカプセル化用）
function getNextLayerId(currentLayerId) {
    const layerMap = {
        'layer1': 'layer2',
        'layer2': 'layer3',
        'layer3': 'layer4',
        'layer4': null
    };
    return layerMap[currentLayerId];
}

// 情報ボックスを更新
function updateInfoBox(message) {
    const infoBox = document.getElementById('processInfo');
    if (infoBox) {
        infoBox.innerHTML = `
            <h4><i class="fas fa-info-circle"></i> 処理の詳細</h4>
            <p>${message}</p>
        `;
    }
}

// アニメーションをリセット
function resetAnimation() {
    // タイムアウトをクリア
    if (currentAnimationTimeout) {
        clearTimeout(currentAnimationTimeout);
    }

    // 全階層を非アクティブ化
    document.querySelectorAll('.layer-box').forEach(box => {
        box.classList.remove('active');
    });

    // 処理テキストをクリア
    document.querySelectorAll('.layer-process').forEach(process => {
        process.textContent = '';
    });

    // 全パケットセグメントを非表示
    document.querySelectorAll('.packet-segment').forEach(segment => {
        segment.classList.remove('show');
    });

    // フロー方向をリセット
    const flowDirection = document.getElementById('flowDirection');
    if (flowDirection) {
        flowDirection.textContent = '送信プロセス';
        flowDirection.style.background = '#f9fafb';
        flowDirection.style.color = '#667eea';
    }

    // 情報ボックスをリセット
    updateInfoBox('ボタンをクリックして、データの流れを確認してください。');

    animationInProgress = false;
}

// ===================================
// スクロールアニメーション
// ===================================
function handleScrollAnimation() {
    const elements = document.querySelectorAll('.layer-overview-card, .layer-detail, .example-box');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.2;
        
        if (elementPosition < screenPosition) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// 初期状態で要素を非表示に設定
document.addEventListener('DOMContentLoaded', function() {
    const elements = document.querySelectorAll('.layer-overview-card, .layer-detail, .example-box');
    
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    // スクロールイベントリスナー
    window.addEventListener('scroll', handleScrollAnimation);
    
    // 初回実行
    handleScrollAnimation();
});

// ===================================
// プロトコルタグのインタラクティブ効果
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    const tags = document.querySelectorAll('.tag');
    
    tags.forEach(tag => {
        tag.addEventListener('click', function() {
            const protocol = this.textContent.trim();
            showProtocolInfo(protocol);
        });
    });
});

// プロトコル情報を表示（簡易的なアラート）
function showProtocolInfo(protocol) {
    const protocolInfo = {
        'HTTP': 'HTTP (Hypertext Transfer Protocol) - Webページを転送するプロトコル。ポート80を使用。',
        'HTTPS': 'HTTPS (HTTP Secure) - HTTPを暗号化したプロトコル。ポート443を使用。SSL/TLSで通信を保護。',
        'FTP': 'FTP (File Transfer Protocol) - ファイル転送プロトコル。ポート20/21を使用。',
        'SMTP': 'SMTP (Simple Mail Transfer Protocol) - メール送信プロトコル。ポート25/587を使用。',
        'DNS': 'DNS (Domain Name System) - ドメイン名をIPアドレスに変換。ポート53を使用。',
        'TCP': 'TCP (Transmission Control Protocol) - 信頼性の高い接続型通信プロトコル。データの順序保証と再送機能を提供。',
        'UDP': 'UDP (User Datagram Protocol) - 高速だが信頼性は低いコネクションレス型プロトコル。リアルタイム通信に適している。',
        'IP': 'IP (Internet Protocol) - インターネット層の主要プロトコル。IPアドレスを使用してデータを転送。',
        'ICMP': 'ICMP (Internet Control Message Protocol) - エラー通知と診断に使用。pingコマンドで利用。',
        'ARP': 'ARP (Address Resolution Protocol) - IPアドレスからMACアドレスを解決するプロトコル。',
        'Ethernet': 'Ethernet - 有線LANの標準規格。MACアドレスを使用してローカルネットワーク内で通信。',
        'Wi-Fi': 'Wi-Fi (IEEE 802.11) - 無線LANの標準規格。電波を使用してネットワーク接続を提供。',
        'PPP': 'PPP (Point-to-Point Protocol) - 2点間の直接接続に使用されるプロトコル。'
    };

    const info = protocolInfo[protocol] || `${protocol} - プロトコル情報は準備中です。`;
    
    // カスタムモーダルの代わりにアラートを使用（シンプル版）
    alert(`📡 ${protocol}\n\n${info}`);
}

// ===================================
// ページ読み込み時の初期アニメーション
// ===================================
window.addEventListener('load', function() {
    // ヘッダーのフェードイン
    const header = document.querySelector('.header');
    if (header) {
        header.style.opacity = '0';
        header.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            header.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';
        }, 100);
    }

    // 階層概要カードの順次表示
    const overviewCards = document.querySelectorAll('.layer-overview-card');
    overviewCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 + (index * 150));
    });
});

// ===================================
// パフォーマンス最適化：スクロールイベントのスロットル
// ===================================
function throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = new Date().getTime();
        if (now - lastCall < delay) {
            return;
        }
        lastCall = now;
        return func(...args);
    };
}

// スクロールイベントをスロットル処理
window.addEventListener('scroll', throttle(function() {
    // ナビゲーションのシャドウ効果
    const nav = document.querySelector('.nav');
    if (nav) {
        if (window.scrollY > 50) {
            nav.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        } else {
            nav.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }
    }
}, 100));

// ===================================
// デバッグ用コンソールログ
// ===================================
console.log('🌐 TCP/IP 4階層モデル学習サイトが読み込まれました');
console.log('📚 データフローアニメーションを楽しんでください！');
