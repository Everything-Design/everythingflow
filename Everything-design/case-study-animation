document.addEventListener("DOMContentLoaded", function () {
  const heroBlocks = document.querySelectorAll(
    ".brand-identity-block.top.is-new-animation"
  );
  const brandWrapper = document.querySelector(
    ".brand-identity-wrapper.is-casestudy"
  );

  let numCards = heroBlocks.length;
  let divCards = 100 / numCards;

  if (window.innerWidth > 991) {
    heroBlocks.forEach(function (heroBlock) {
      const staticImg = heroBlock.querySelector(".brand-identity-img");
      const verticalTextContainer = heroBlock.querySelector(".hero-collumn");
      const bottomTextWrapper = heroBlock.querySelector(
        ".hero-card_-bottom-text-wrapper"
      );

      let enterTimeline = gsap.timeline();
      let leaveTimeline = gsap.timeline();

      heroBlock.addEventListener("mouseenter", function () {
        enterTimeline.clear();

        heroBlocks.forEach(function (block) {
          if (block !== heroBlock) {
            enterTimeline.add(
              gsap.to(heroBlock, {
                width: "100%",
                ease: "sine.out",
                duration: 0.1,
              }),
              gsap.to(bottomTextWrapper, {
                opacity: 1,
                ease: "power1.in",
                duration: 0.1,
              }),
              gsap.to(block, {
                width: "6rem",
                ease: "sine.out",
                duration: 0.1,
              }),
              gsap.to(block.querySelector(".hero-collumn"), {
                width: "100%",
                ease: "power1.out",
                duration: 0.1,
              }),
              gsap.to(block.querySelector(".hero-card_-bottom-text-wrapper"), {
                opacity: 0,
                ease: "power1.in",
                duration: 0.1,
              }),
              gsap.to(staticImg, {
                opacity: 0,
                ease: "power1.out",
                duration: 0.1,
              }),
              gsap.to(verticalTextContainer, {
                width: "0",
                ease: "power1.out",
                duration: 0.1,
              })
            );
          }

          const videoLottie = heroBlock.querySelector(
            ".video-lottie.is-updated"
          );
          if (videoLottie) {
            if (videoLottie.tagName.toLowerCase() === "video") {
              // Only call play() if it's a video element
              if (typeof videoLottie.play === "function") {
                videoLottie.play();
              }
            } else {
              // Assuming there is a method to play Lottie animations
              if (typeof videoLottie.play === "function") {
                videoLottie.play();
              }
            }
          }
        });
      });

      brandWrapper.addEventListener("mouseleave", function (e) {
        enterTimeline.clear();
        leaveTimeline.clear();

        heroBlocks.forEach(function (block) {
          leaveTimeline
            .add(
              gsap.to(block, {
                width: divCards + "%",
                ease: "power1.out",
                duration: 0.1,
              }),
              gsap.to(block.querySelector(".hero-collumn"), {
                width: "0%",
                ease: "power1.out",
                duration: 0.1,
              }),
              gsap.to(block.querySelector(".brand-identity-img"), {
                opacity: 1,
                ease: "power1.out",
                duration: 0.1,
              })
            )
            .to(block.querySelector(".hero-card_-bottom-text-wrapper"), {
              opacity: 1,
              ease: "power1.in",
              duration: 0,
            });

          const videoLottie = block.querySelector(".video-lottie.is-updated");
          if (videoLottie) {
            if (videoLottie.tagName.toLowerCase() === "video") {
              videoLottie.pause();
              videoLottie.currentTime = 0;
            } else {
              // Assuming there is a method to stop Lottie animations
              if (typeof videoLottie.stop === "function") {
                videoLottie.stop();
              }
            }
          }
        });
      });
    });
  } else {
    heroBlocks.forEach(function (heroBlock) {
      const videoLottie = heroBlock.querySelector(".video-lottie.is-updated");
      if (videoLottie) {
        if (videoLottie.tagName.toLowerCase() === "video") {
          videoLottie.play();
        } else {
          // Assuming a method to auto-play Lottie animation exists
          if (typeof videoLottie.play === "function") {
            videoLottie.play();
          }
        }
      }
    });
  }
});
