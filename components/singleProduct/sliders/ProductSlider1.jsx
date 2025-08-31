"use client";

import { useEffect, useState, useMemo } from "react";
import { Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/thumbs";
import "swiper/css";
import "photoswipe/dist/photoswipe.css";
import { Gallery, Item } from "react-photoswipe-gallery";
import Image from "next/image";
import tippy from "tippy.js";

export default function ProductSlider1({ images = [] }) {
  useEffect(() => {
    tippy("[data-tippy-content]");
  }, []);

  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const items = useMemo(
    () =>
      (images.length ? images : ["/images/placeholder-674x674.png"]).map((url) => ({
        imgSrc: url,
      })),
    [images]
  );

  return (
    <div className="product-single__media vertical-thumbnail product-media-initialized">
      <div className="product-single__image position-relative">
        <Gallery>
          <Swiper
            modules={[Thumbs, Navigation]}
            slidesPerView={1}
            thumbs={{ swiper: thumbsSwiper }}
            navigation={{ prevEl: ".ssnbp1", nextEl: ".ssnbn1" }}
            className="swiper-container swiper-container-initialized swiper-container-horizontal swiper-container-pointer-events"
          >
            {items.map((elm, i) => (
              <SwiperSlide
                key={i}
                style={{ maxWidth: "100%", overflow: "hidden", position: "relative" }}
                className="swiper-slide product-single__image-item"
              >
                <Item original={elm.imgSrc} thumbnail={elm.imgSrc} width="674" height="674">
                  {({ ref, open }) => (
                    <>
                      <Image
                        loading="lazy"
                        className="h-auto w-100"
                        src={elm.imgSrc}
                        width={674}
                        height={674}
                        alt="image"
                      />
                      <a
                        ref={ref}
                        onClick={open}
                        className="item-zoom"
                        data-bs-toggle="tooltip"
                        data-bs-placement="left"
                        data-tippy-content="Zoom"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <use href="#icon_zoom" />
                        </svg>
                      </a>
                    </>
                  )}
                </Item>
              </SwiperSlide>
            ))}

            <div className="cursor-pointer swiper-button-prev ssnbp1">
              <svg width="7" height="11" viewBox="0 0 7 11">
                <use href="#icon_prev_sm" />
              </svg>
            </div>
            <div className="cursor-pointer swiper-button-next ssnbn1">
              <svg width="7" height="11" viewBox="0 0 7 11">
                <use href="#icon_next_sm" />
              </svg>
            </div>
          </Swiper>
        </Gallery>
      </div>

      <div className="product-single__thumbnail" style={{ 
        maxHeight: '674px', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Swiper
          modules={[Thumbs]}
          breakpoints={{
            0: { direction: "horizontal", slidesPerView: 4 },
            992: { direction: "vertical" },
          }}
          className="swiper-container swiper-container-initialized swiper-container-pointer-events swiper-container-free-mode swiper-container-thumbs swiper-container-horizontal"
          onSwiper={setThumbsSwiper}
          slidesPerView={4}
          style={{
            height: '100%',
            maxHeight: '674px'
          }}
        >
          {items.map((elm, i) => (
            <SwiperSlide key={i} className="swiper-slide product-single__image-item" style={{ 
              marginBottom: 10,
              height: 'auto',
              maxHeight: '104px'
            }}>
              <Image 
                loading="lazy" 
                className="h-auto w-100" 
                src={elm.imgSrc} 
                width={104} 
                height={104} 
                alt="image"
                style={{
                  objectFit: 'cover',
                  maxHeight: '104px'
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
