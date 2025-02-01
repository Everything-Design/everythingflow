
(function () {
    let badge = document.createElement("div");
    badge.innerHTML = `
        <a href="https://everythingflow.agency/" target="_blank" class="ef-recreation-tag w-inline-block">
            <div class="w-embed">
                <style>
                  @media only screen and (min-width: 1440px) { 
                      .ef-recreation-tag {
                        font-size: 1rem
                      }
                  }
                  @media only screen and (max-width: 1439px) { 
                      .ef-recreation-tag {
                        font-size: 0.8rem
                      }
                  }
                  @media only screen and (max-width: 992px) { 
                      .ef-recreation-tag {
                        font-size: 0.8rem
                      }
                  }
                  @media only screen and (max-width: 480px) { 
                      .ef-recreation-tag {
                        font-size: 0.6rem
                      }
                  }
                  
                    .ef-recreation-tag {
                        z-index: 40;
                        grid-column-gap: .4rem;
                        grid-row-gap: .4rem;
                        outline-offset: -1px;
                        background-color: #c4cc25;
                        border-radius: .25rem;
                        outline: 1px solid #003325;
                        justify-content: flex-start;
                        align-items: center;
                        width: auto;
                        padding: .5em .5em .5em .2em;
                        font-size: 1rem;
                        display: flex;
                        position: fixed;
                        inset: auto auto .5em .5em;
                        box-shadow: inset 0 1px 4px #0003;
                        transition: 500ms background-color ease;
                    }
                    .ef-re-brand-logo {  
                        width: 1.2em !important;  
                    }
                    .ef-re-wrap {
                        display: flex;
                        width: 100%;
                        flex-direction: column;
                        flex-wrap: nowrap;
                    }
                    .abs-content-img {
                        position: absolute;
                        left: 0rem;
                        bottom: 100%;
                        z-index: 20;
                        width: 100%;
                        max-width: 13rem;
                        padding-top: 0.5rem;
                        padding-right: 0.5rem;
                        padding-bottom: 0.5rem;
                        padding-left: 0.5rem;
                        border-top-left-radius: 0.25em;
                        border-top-right-radius: 0.25em;
                        background-color: hsla(0, 0.00%, 100.00%, 1.00);
                    }
                    .ef-re-text {
                        width: 100%;
                        max-width: 12em;
                    }
                    .ef-recreation-tag:hover {
                        background-color: #DCE07C;
                    }
                    .ef-recreation-tag .ef-re-wrap .abs-content-img {
                        opacity: 0;
                        transition: 500ms opacity ease;
                    }
                    .ef-recreation-tag:hover .ef-re-wrap .abs-content-img {
                        opacity: 1;
                    }
                </style>
            </div>
            <img src="https://cdn.prod.website-files.com/6435988d3f4500e4270fb5a3/6435988d3f450020310fb5ee_Everything%20Design%20Webclip.webp" 
                loading="lazy" alt="everything flow logo" class="ef-re-brand-logo">
            <div class="ef-re-wrap">
                <img src="https://cdn.prod.website-files.com/6435988d3f4500e4270fb5a3/679df272691f471fabf7ba5d_We%20do%20not%20own.svg" 
                    loading="lazy" alt="" class="abs-content-img">
                <img src="https://cdn.prod.website-files.com/6435988d3f4500e4270fb5a3/679df1746a65bbbe7baddeb9_Recreation%20by%20Everything%20Flow.svg" 
                    loading="lazy" alt="" class="ef-re-text">
            </div>
        </a>
    `;

    // Append badge to the body
    document.body.appendChild(badge);
})();
