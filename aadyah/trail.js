document.addEventListener("DOMContentLoaded", function () {
    gsap.registerPlugin(ScrollTrigger, Flip);
  
    let gradientText = document.getElementById("gradient-text");
    let gradientTextTwo = document.getElementById("gradient-text-two");
    let gradientTextThree = document.getElementById("gradient-text-three");
    let bgSec = document.getElementById("bg-sec");
    let horSectionTwo = document.getElementById("hor-sec-2");
    let horSectionThree = document.getElementById("hor-sec-3");
    let horSectionFour = document.getElementById("hor-sec-4");
    let horSectionEarthDummy = document.getElementById("earth-sec");
    let horSectionSix = document.getElementById("hor-sec-6");
    let horSectionEarth = document.getElementById("hor-sec-earth");
    let horSectionSeven = document.getElementById("hor-sec-7");
    let horSectionEight = document.getElementById("hor-sec-8");
    let horSectionNine = document.getElementById("hor-sec-9");
    let horSectionTen = document.getElementById("hor-sec-10");
    let horSectionEleven = document.getElementById("hor-sec-11");
    let horSectionMoonDummy = document.getElementById("moon-sec");
    let horSectionTwelve = document.getElementById("hor-sec-12");
    let horSectionThirteen = document.getElementById("hor-sec-13");
    let horSectionForteen = document.getElementById("hor-sec-14");
    let horSectionFifteen = document.getElementById("hor-sec-15");
    let horSectionMarsDummy = document.getElementById("mars-sec");
    let horSectionSixteen = document.getElementById("hor-sec-16");
    let horSectionSeventeen = document.getElementById("hor-sec-17");
    let horSectionFooter = document.getElementById("hor-sec-footer");
    let dataNumber = document.getElementsByClassName("data-number-div");
    const starLine = document.querySelector(".star-ray-line");
  
    let wrapper = document.getElementById("wrapper");
    let wrapperWidth = wrapper.offsetWidth;
    let wrapWidth = horSectionTwo.offsetWidth;
    let totalMove = wrapperWidth - wrapWidth;
  
    let earthWrap = document.getElementById("earth-wrap-content");
    let earthWrapperWidth = earthWrap.offsetWidth;
    let earthWrapWidth = horSectionSix.offsetWidth;
    let earthTotalMove = earthWrapperWidth - earthWrapWidth;
    const coolVideo = document.querySelector(".earthvideo");
  
    let wrapperDebries = document.getElementById("wrapperDebri");
    let wrapperWidthDebri = wrapperDebries.offsetWidth;
    let wrapWidthDebri = horSectionNine.offsetWidth;
    let totalMoveDebri = wrapperWidthDebri - wrapWidthDebri;
  
    let wrapperMoon = document.getElementById("wrapperMoon");
    let wrapperWidthMoon = wrapperMoon.offsetWidth;
    let wrapWidthMoon = horSectionTwelve.offsetWidth;
    let totalMoveMoon = wrapperWidthMoon - wrapWidthMoon;
  
    let wrapperMarsText = document.getElementById("wrapperMarsText");
    let wrapperWidthMarsText = wrapperMarsText.offsetWidth;
    let wrapWidthMarsText = horSectionForteen.offsetWidth;
    let totalMoveMarsText = wrapperWidthMarsText - wrapWidthMarsText;
  
    let wrapperMars = document.getElementById("wrapperMars");
    let wrapperWidthMars = wrapperMars.offsetWidth;
    let wrapWidthMars = horSectionSixteen.offsetWidth;
    let totalMoveMars = wrapperWidthMars - wrapWidthMars;
  
    function scrollToTop() {
      window.scrollTo(0, 0);
    }
  
    // Function to reset horizontal scroll to initial state
    function resetHorizontalScroll() {
      // Replace ".your-horizontal-scroll-container" with the actual selector for your horizontal scroll container
      var scrollContainer = document.querySelector(".track");
  
      // Reset the horizontal scroll position to 0
      if (scrollContainer) {
        scrollContainer.scrollLeft = 0;
      }
    }
  
    // Check if the page is being reloaded with the "reload" query parameter
    if (window.location.search.includes("reload=true")) {
      // If it's a page reload, reset the horizontal scroll and scroll to top
      resetHorizontalScroll();
      scrollToTop();
    }
  
    // Function to check screen size and refresh the page if it changes
    function checkScreenSize() {
      var currentWidth = window.innerWidth;
      var currentHeight = window.innerHeight;
  
      // Check if the screen width or height has changed
      if (
        currentWidth !== window.screenWidth ||
        currentHeight !== window.screenHeight
      ) {
        // Update the stored screen width and height
        window.screenWidth = currentWidth;
        window.screenHeight = currentHeight;
  
        // Save the current scroll position
        var scrollX = window.scrollX;
        var scrollY = window.scrollY;
  
        // Store the initial scroll position as a custom attribute
        document.body.setAttribute("data-scroll-x", scrollX);
        document.body.setAttribute("data-scroll-y", scrollY);
  
        // Reload the page without adding the query parameter to the URL
        window.location.href = window.location.pathname;
      }
    }
  
    // Check for screen size changes on window resize and orientation change
    window.addEventListener("resize", checkScreenSize);
    window.addEventListener("orientationchange", checkScreenSize);
  
    // Restore the initial scroll position when the page is loaded
    window.addEventListener("load", function () {
      var initialScrollX = document.body.getAttribute("data-scroll-x");
      var initialScrollY = document.body.getAttribute("data-scroll-y");
  
      if (initialScrollX !== null && initialScrollY !== null) {
        window.scrollTo(parseInt(initialScrollX), parseInt(initialScrollY));
      }
    });
  
    // Optional - Set sticky section heights based on inner content width
    // Makes scroll timing feel more natural
    function setTrackHeights() {
      $(".section-height").each(function (index) {
        let trackWidth = $(this).find(".section-height").outerWidth();
        $(this).height(trackWidth);
      });
    }
    setTrackHeights();
    window.addEventListener("resize", function () {
      setTrackHeights();
    });
  
    //Main timeline for contianerAnimation//
    let tlMain = gsap
      .timeline({
        scrollTrigger: {
          trigger: ".section-height",
          start: "top top",
          end: "98% bottom",
          //markers: true,
          scrub: 1,
          onUpdate: (self) => {
            if (self.direction === 1) {
              starLine.classList.remove("rotate");
            } else {
              starLine.classList.add("rotate");
            }
          },
        },
      })
      .to(".track", {
        xPercent: -100,
        ease: "none",
      })
      .fromTo(".abs-start-div", { x: "-45%" }, { x: "49%" }, 0);
  
    gsap
      .timeline({
        scrollTrigger: {
          trigger: "#hor-sec-1",
          start: "2% left",
          end: "2% left",
          toggleActions: "restart none none reverse",
          duration: 0.2,
          //markers: true
        },
      })
      .fromTo(
        ".front-logo-img",
        { opacity: 1, filter: "blur(0px)" },
        { opacity: 0, filter: "blur(100px)", ease: Linear.easeNone }
      )
      .fromTo(
        ".back-logo-img",
        { opacity: 1, filter: "blur(0px)" },
        { opacity: 0, filter: "blur(100px)", ease: Linear.easeNone },
        0
      )
      .fromTo(".scroll-next-div", { opacity: 1 }, { opacity: 0 }, 0);
  
    //<--Text Animation Starts-->//
    gsap
      .timeline({
        scrollTrigger: {
          trigger: wrapper,
          //endTrigger: wrapper,
          containerAnimation: tlMain,
          start: "left left",
          end: "right right",
          pin: true,
          scrub: true,
          //markers: true
        },
      })
      .fromTo(horSectionTwo, { x: 0 }, { x: totalMove, ease: "none" }, 0);
  
    //1st Gradient Text animation//
    gsap
      .timeline({
        scrollTrigger: {
          trigger: horSectionTwo,
          containerAnimation: tlMain,
          start: "left right",
          end: "right left",
          scrub: true,
          //markers: true
        },
      })
      .fromTo(
        gradientText,
        { backgroundPosition: "100vw 0%" },
        { backgroundPosition: "-100vw 0%", ease: "none" }
      );
  
    gsap
      .timeline({
        scrollTrigger: {
          trigger: horSectionTwo,
          containerAnimation: tlMain,
          start: "left center",
          end: "right right",
          scrub: true,
          //markers: true
        },
      })
      .fromTo(gradientText, { opacity: 0 }, { opacity: 1 });
  
    //2nd Gradient Text animation//
    gsap
      .timeline({
        scrollTrigger: {
          trigger: horSectionThree,
          containerAnimation: tlMain,
          start: "left right",
          end: "right left",
          scrub: true,
          //markers: true
        },
      })
      .fromTo(
        gradientTextTwo,
        { backgroundPosition: "100vw 0%" },
        { backgroundPosition: "-100vw 0%", ease: "none" }
      );
  
    gsap
      .timeline({
        scrollTrigger: {
          trigger: horSectionThree,
          containerAnimation: tlMain,
          start: "left center",
          end: "right right",
          scrub: true,
          //markers: true
        },
      })
      .fromTo(gradientTextTwo, { opacity: 0 }, { opacity: 1 });
  
    //3rd Gradient Animation//
    gsap
      .timeline({
        scrollTrigger: {
          trigger: horSectionFour,
          containerAnimation: tlMain,
          start: "left right",
          end: "right left",
          scrub: true,
          //markers: true
        },
      })
      .fromTo(bgSec, { opacity: 1 }, { opacity: 0 })
      .fromTo(
        gradientTextThree,
        { backgroundPosition: "100vw 0%" },
        { backgroundPosition: "-100vw 0%", ease: "none" },
        0
      );
  
    gsap
      .timeline({
        scrollTrigger: {
          trigger: horSectionFour,
          containerAnimation: tlMain,
          start: "left center",
          end: "right right",
          scrub: true,
          //markers: true
        },
      })
      .fromTo(gradientTextThree, { opacity: 0 }, { opacity: 1 });
    //<!--Text Animation Ends-->//
  
    //<!--Earth animation starts here->//
    //satellite-roation
    gsap
      .timeline({
        scrollTrigger: {},
      })
      .fromTo(
        ".satellite-div-1",
        30,
        { rotationZ: 120 },
        {
          rotation: 480,
          repeat: -1,
          ease: Linear.easeNone,
        }
      )
      .fromTo(
        ".satellite-div-2",
        30,
        { rotationZ: -120 },
        {
          rotation: 240,
          repeat: -1,
          ease: Linear.easeNone,
        },
        0
      )
      .to(
        ".satellite-div-3",
        30,
        {
          rotation: 360,
          repeat: -1,
          ease: Linear.easeNone,
        },
        0
      );
  
    //Earth 3section Movement
    gsap
      .timeline({
        scrollTrigger: {
          trigger: earthWrap,
          //endTrigger: wrapper,
          containerAnimation: tlMain,
          start: "left left",
          end: "right right",
          pin: true,
          //markers: true,
          scrub: true,
        },
      })
      .fromTo(horSectionSix, { x: 0 }, { x: earthTotalMove, ease: "none" }, 0);
  
    //Earth movement//
  
    gsap
      .timeline({
        scrollTrigger: {
          trigger: horSectionEarthDummy,
          //endTrigger: wrapper,
          containerAnimation: tlMain,
          toggleActions: "restart none none reverse",
          start: "right right",
          end: "right center",
          pin: true,
          //markers: true
          //scrub: true
        },
      })
      .fromTo(
        ".globe-final",
        { opacity: 0 },
        { opacity: 1, ease: Power1.easeOut, duration: 1 }
      );
  
    gsap
      .timeline({
        scrollTrigger: {
          containerAnimation: tlMain,
          trigger: horSectionSix,
          start: "left right",
          end: "center center",
          //markers: true,
          scrub: true,
          //pin: true
        },
      })
      .from(".globe-final", {
        x: "-100vw",
        y: "-20vw",
        width: "40vw",
        height: "40vw",
        ease: "none",
      })
      .fromTo("#earth-overlay", { opacity: 0 }, { opacity: 1 }, 0);
  
    //First content Reveal
    gsap
      .timeline({
        scrollTrigger: {
          containerAnimation: tlMain,
          trigger: horSectionSeven,
          start: "left right",
          end: "right left",
          toggleActions: "restart none none reverse",
          //markers: true
          //pin: true
        },
      })
      .fromTo(
        ".card-content-wrap",
        { opacity: 0, display: "none" },
        { opacity: 1, display: "grid" }
      )
      .fromTo("#earth-abs-txt", { opacity: 0 }, { opacity: 1 }, 0);
  
    //Second Card Content reveal with Satellite reveal
    gsap
      .timeline({
        scrollTrigger: {
          containerAnimation: tlMain,
          trigger: horSectionEight,
          start: "left right",
          end: "right left",
          toggleActions: "restart none none reverse",
          //markers: true
          //pin: true
        },
      })
      .to(".card-content-wrap", { opacity: 0, display: "none" })
      .fromTo(
        ".card-content-wrap-two",
        { opacity: 0, display: "none" },
        { opacity: 1, display: "grid" }
      )
      .fromTo(
        ".earth-outer-ring",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, stagger: 0.5 },
        0
      )
      .to("#earth-abs-txt", { opacity: 0 }, 0);
  
    //<!--Earth Animation Over Here-->//
  
    //<!--Debries Animation starts here-->//
  
    //Debries 3Section move
    gsap
      .timeline({
        scrollTrigger: {
          trigger: wrapperDebries,
          containerAnimation: tlMain,
          start: "left left",
          end: "right right",
          pin: true,
          scrub: true,
          //markers: true
        },
      })
      .fromTo(horSectionNine, { x: 0 }, { x: totalMoveDebri, ease: "none" }, 0);
  
    //First Text reveal animation
    gsap
      .timeline({
        scrollTrigger: {
          trigger: horSectionNine,
          containerAnimation: tlMain,
          start: "left right",
          end: "right left",
          //markers: true,
          scrub: true,
        },
      })
      .fromTo(
        "#white-text-one",
        { backgroundPosition: "100vw 0%" },
        { backgroundPosition: "-100vw 0%", ease: "none" }
      );
  
    gsap
      .timeline({
        scrollTrigger: {
          trigger: horSectionNine,
          containerAnimation: tlMain,
          start: "left center",
          end: "right right",
          scrub: true,
          //markers: true
        },
      })
      .fromTo("#white-text-one", { opacity: 0 }, { opacity: 1 });
  
    //Debries show
    gsap
      .timeline({
        scrollTrigger: {
          trigger: horSectionTen,
          containerAnimation: tlMain,
          start: "left center",
          end: "right right",
          //markers: true,
          toggleActions: "restart none none reverse",
          //scrub: true
        },
      })
      .fromTo(".debries", { opacity: 0 }, { opacity: 1 })
      .fromTo(".debries-description", { opacity: 0 }, { opacity: 1 });
  
    //Second Text Reveal
    gsap
      .timeline({
        scrollTrigger: {
          trigger: horSectionEleven,
          containerAnimation: tlMain,
          start: "left right",
          end: "right left",
          //markers: true,
          scrub: true,
        },
      })
      .fromTo(
        "#white-text-two",
        { backgroundPosition: "100vw 0%" },
        { backgroundPosition: "-100vw 0%", ease: "none" }
      );
  
    gsap
      .timeline({
        scrollTrigger: {
          trigger: horSectionEleven,
          containerAnimation: tlMain,
          start: "left center",
          end: "right right",
          //markers: true,
          toggleActions: "restart none none reverse",
          //scrub: true
        },
      })
      .to(".debries", { opacity: 0 })
      .to(".debries-description", { opacity: 0 }, 0);
  
    gsap
      .timeline({
        scrollTrigger: {
          trigger: horSectionEleven,
          containerAnimation: tlMain,
          start: "left center",
          end: "right right",
          //markers: true,
          scrub: true,
        },
      })
      .fromTo("#white-text-two", { opacity: 0 }, { opacity: 1 });
    //<!--Debries Animation Ends here -->//
  
    //<!-- Moon Animation starts here -->//
    //Moon section move//
    gsap
      .timeline({
        scrollTrigger: {
          trigger: wrapperMoon,
          //endTrigger: wrapper,
          containerAnimation: tlMain,
          start: "left left",
          end: "right right",
          pin: true,
          //markers: true,
          scrub: true,
        },
      })
      .fromTo(horSectionTwelve, { x: 0 }, { x: totalMoveMoon, ease: "none" });
  
    //Moon reveal and placement aniamtion//
    gsap
      .timeline({
        scrollTrigger: {
          trigger: horSectionMoonDummy,
          //endTrigger: wrapper,
          containerAnimation: tlMain,
          toggleActions: "restart none none reverse",
          start: "right right",
          end: "right center",
          pin: true,
          //markers: true
          //scrub: true
        },
      })
      .fromTo(
        ".moon-final",
        { opacity: 0 },
        { opacity: 1, ease: Power1.easeOut, duration: 1 }
      );
  
    gsap
      .timeline({
        scrollTrigger: {
          containerAnimation: tlMain,
          trigger: horSectionTwelve,
          start: "left right",
          end: "center center",
          //markers: true,
          scrub: true,
          //pin: true
        },
      })
      .from(".moon-final", {
        x: "-100vw",
        y: "-20vw",
        width: "40vw",
        height: "40vw",
        ease: "none",
      })
      .fromTo("#moon-overlay", { opacity: 0 }, { opacity: 1 }, 0);
  
    //Moon content card reveal//
    gsap
      .timeline({
        scrollTrigger: {
          containerAnimation: tlMain,
          trigger: horSectionThirteen,
          start: "left right",
          end: "right left",
          toggleActions: "restart none none reverse",
          //markers: true
          //pin: true
        },
      })
      .fromTo(
        "#card-content-moon",
        { opacity: 0, display: "none" },
        { opacity: 1, display: "flex" }
      )
      .fromTo("#moon-abs-txt", { opacity: 0 }, { opacity: 1 }, 0);
    //<!-- Moon animation ends here-->//
  
    //<!-- Mars Text aniamtion starts here-->//
  
    //Mars 3section move animation//
    gsap
      .timeline({
        scrollTrigger: {
          trigger: wrapperMarsText,
          //endTrigger: wrapper,
          containerAnimation: tlMain,
          start: "left left",
          end: "right right",
          pin: true,
          //markers: true,
          scrub: true,
        },
      })
      .fromTo(
        horSectionForteen,
        { x: 0 },
        { x: totalMoveMarsText, ease: "none" }
      );
  
    //Red-text animation//
    gsap
      .timeline({
        scrollTrigger: {
          trigger: horSectionFifteen,
          containerAnimation: tlMain,
          start: "left right",
          end: "right left",
          //markers: true,
          scrub: true,
        },
      })
      .fromTo(
        "#red-text",
        { backgroundPosition: "100vw 0%" },
        { backgroundPosition: "-100vw 0%", ease: "none" }
      );
    //<!-- Mars Text aniamtion ends here-->//
  
    //<!-- Mars animation starts here-->//
    //Mars section movement//
    gsap
      .timeline({
        scrollTrigger: {
          trigger: wrapperMars,
          //endTrigger: wrapper,
          containerAnimation: tlMain,
          start: "left left",
          end: "right right",
          pin: true,
          //markers: true,
          scrub: true,
        },
      })
      .fromTo(horSectionSixteen, { x: 0 }, { x: totalMoveMars, ease: "none" });
  
    //Mars reveal and movement //
  
    gsap
      .timeline({
        scrollTrigger: {
          trigger: horSectionMarsDummy,
          //endTrigger: wrapper,
          containerAnimation: tlMain,
          toggleActions: "restart none none reverse",
          start: "right right",
          end: "right center",
          pin: true,
          //markers: true
          //scrub: true
        },
      })
      .fromTo(
        ".mars-final",
        { opacity: 0 },
        { opacity: 1, ease: Power1.easeOut, duration: 1 }
      );
  
    gsap
      .timeline({
        scrollTrigger: {
          containerAnimation: tlMain,
          trigger: horSectionSixteen,
          start: "left right",
          end: "center center",
          //markers: true,
          scrub: true,
          //pin: true
        },
      })
      .from(".mars-final", {
        x: "-100vw",
        y: "-20vw",
        width: "40vw",
        height: "40vw",
        ease: "none",
      })
      .fromTo("#mars-overlay", { opacity: 0 }, { opacity: 1 }, 0);
  
    gsap
      .timeline({
        scrollTrigger: {
          containerAnimation: tlMain,
          trigger: horSectionSeventeen,
          start: "left right",
          end: "right left",
          toggleActions: "restart none none reverse",
          //markers: true
          //pin: true
        },
      })
      .fromTo(
        "#card-content-mars",
        { opacity: 0, display: "none" },
        { opacity: 1, display: "flex" }
      )
      .fromTo("#mars-abs-txt", { opacity: 0 }, { opacity: 1 }, 0);
  
    //<!--Mars Animation Ends here-->//
  
    //<!--Footer animation starts here-->//
    gsap.set(dataNumber, { scale: 1 });
  
    function animateNumber(index) {
      gsap.fromTo(
        dataNumber[index],
        { color: "white", opacity: 0.1 },
        { color: "#EB4949", opacity: 1, duration: 0.5 }
      );
      gsap.to(dataNumber[index], {
        scale: 1.2,
        duration: 1,
        ease: "none",
        onComplete: () => {
          gsap.to(dataNumber[index], {
            scale: 1,
            duration: 1,
            ease: "none",
            onComplete: () => {
              gsap.fromTo(
                dataNumber[index],
                { color: "#EB4949", opacity: 1 },
                { color: "white", opacity: 0.1, duration: 0.5 }
              );
              // Move to the next number
              const nextIndex = (index + 1) % dataNumber.length;
              animateNumber(nextIndex);
            },
          });
        },
      });
    }
    animateNumber(0);
    //<!--Footer animation starts here-->//
  });