(function () {
    let badge = document.createElement("div");
    badge.innerHTML = `
        <a href="https://everythingflow.agency/" target="_blank" class="ef-recreation-tag w-inline-block">
            <div class="w-embed">
                <style>
                    .ef-recreation-tag {
                        transition: 500ms background-color ease;
                        display: inline-block;
                        padding: 10px;
                        border-radius: 8px;
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
                loading="lazy" alt="everything flow logo" class="ef-re-logo">
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
