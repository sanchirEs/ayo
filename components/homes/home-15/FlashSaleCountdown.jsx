"use client";

import { useEffect, useState } from "react";
import styles from "./FlashSaleCountdown.module.css";

export default function FlashSaleCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 10,
    seconds: 0
  });
  const [isNotified, setIsNotified] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Set initial time to 10 minutes
    const initialTime = 10 * 60; // 10 minutes in seconds
    let secondsLeft = initialTime;

    const timer = setInterval(() => {
      if (secondsLeft <= 0) {
        // Reset to 10 minutes when countdown reaches 0
        secondsLeft = initialTime;
        // Show notification when countdown resets
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      } else {
        secondsLeft--;
      }

      const days = Math.floor(secondsLeft / (24 * 60 * 60));
      const hours = Math.floor((secondsLeft % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((secondsLeft % (60 * 60)) / 60);
      const seconds = secondsLeft % 60;

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => num.toString().padStart(2, '0');

  const handleNotifyClick = () => {
    setIsNotified(true);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
    
    // In a real app, you would send this to your backend
    // console.log("User requested notification for flash sale");
  };

  return (
      <section className={`products-carousel ${styles.flashSaleCountdown}`}>
        {/* Background Image */}
        <div className={styles.backgroundImageContainer}>
          <img 
            src="/assets/images/banner/banner3.jpg" 
            alt="Flash Sale Background"
            className={styles.backgroundImage}
          />
        </div>

        {/* Notification Toast */}
        {showNotification && (
          <div className={`position-fixed top-0 start-50 translate-middle-x p-3 ${styles.notificationToast}`} style={{ zIndex: 9999 }}>
            <div className="bg-success text-white rounded-3 p-3 d-flex align-items-center gap-2">
              <span>🔔</span>
              <span>{isNotified ? "Flash sale эхлэхэд мэдэгдэх болно!" : "Flash sale дахин эхэллээ!"}</span>
            </div>
          </div>
        )}

    <div className={`py-4 px-4 ${styles.countdownContainer}`}>
      <div className={styles.contentBox}>
        {/* Flash Sale Icon and Title */}
        <div className="mb-3">
          <div className="fs-1 mb-2">⚡</div>
          <h2 className={`section-title text-uppercase fs-25 fw-bold mb-2 ${styles.countdownTitle}`}>
            10 минутын хямдрал	
          </h2>
          <p className={`fs-16 mb-3 ${styles.countdownSubtitle}`}>
            Хямдрал эхлэхэд үлдсэн хугацаа
          </p>
        </div>
      
        <div className={`${styles.countdownTimer}`}>

              
              <div className="text-center">
                <div className={`${styles.timerBox}`}>
                  <span className={styles.timerNumber}>{formatNumber(timeLeft.hours)}</span>
                  <small className={styles.timerLabel}>Цаг</small>
                </div>
              </div>
              
              <div className="text-center">
                <div className={`${styles.timerBox}`}>
                  <span className={styles.timerNumber}>{formatNumber(timeLeft.minutes)}</span>
                  <small className={styles.timerLabel}>Минут</small>
                </div>
              </div>
              
              <div className="text-center">
                <div className={`${styles.timerBox}`}>
                  <span className={styles.timerNumber}>{formatNumber(timeLeft.seconds)}</span>
                  <small className={styles.timerLabel}>Секунд</small>
                </div>
              </div>
            </div>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Хямдрал тун удахгүй</h3>
              <p className="text-secondary mb-3">
                Онцгой хямдралтай бараанууд хүлээж байна:
              </p>
              <ul className={styles.infoList}>
                <li>Сонгосон бараануудад 70% хүртэл хямдрал</li>
                <li>Зөвхөн өнөөдөрт зориулсан онцгой хямдрал</li>
              </ul>
              <div className="mt-3">
                <button 
                  className={`btn btn-lg px-4 py-2 ${styles.notifyButton}`}
                  onClick={handleNotifyClick}
                  disabled={isNotified}
                >
                  {isNotified ? 'Мэдэгдэх' : 'Мэдэгдэл авах'}
                </button>
                {isNotified && (
                  <p className="text-success mt-2 mb-0">
                    <small>✓ Flash sale эхлэхэд мэдэгдэх болно!</small>
                  </p>
                )}
              </div>
            </div>

             {/* Additional Info */}
             <div className="mt-3">
              <p className="text-white opacity-75 mb-1">
                <small>Өдөр бүр аравхан минут</small>
              </p>
              {/* <p className="text-white opacity-75">
                <small>Хязгаарлагдмал тоо - хурдан захиална уу!</small>
              </p> */}
            </div>
      </div>
             </div>
       
       </section>
  );
}
