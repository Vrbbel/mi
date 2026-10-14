// ==UserScript==
// @name         空行圧縮
// @namespace    https://github.com/Vrbbel/mi
// @version      1.3.0
// @description  小説家になろう・ノクターン・カクヨム本文の連続空行を圧縮します
// @match        https://ncode.syosetu.com/*
// @match        https://novel18.syosetu.com/*
// @match        https://kakuyomu.jp/works/*/episodes/*
// @grant        none
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/Vrbbel/mi/main/blank-lines.user.js
// @downloadURL  https://raw.githubusercontent.com/Vrbbel/mi/main/blank-lines.user.js
// ==/UserScript==

(() => {
    'use strict';

    // 0 = 空行を全部消す
    // 1 = 連続空行を最大1行だけ残す
    // 2 = 最大2行残す
    // ...
    const KEEP_BLANK_LINES = 1;

    function isBlankParagraph(p) {
        const text = p.textContent
            .replace(/\u00a0/g, '')
            .replace(/\u3000/g, '')
            .trim();

        const html = p.innerHTML
            .replace(/&nbsp;/gi, '')
            .replace(/<br\s*\/?>/gi, '')
            .trim();

        return text === '' && html === '';
    }

    function getNovelBodies() {
        if (
            location.hostname === 'ncode.syosetu.com' ||
            location.hostname === 'novel18.syosetu.com'
        ) {
            return [
                ...document.querySelectorAll(
                    '.js-novel-text.p-novel__text:not(.p-novel__text--preface):not(.p-novel__text--afterword)'
                )
            ];
        }

        if (location.hostname === 'kakuyomu.jp') {
            const selectors = [
                'div.widget-episodeBody.js-episode-body',
                'div.widget-episodeBody',
                'div.js-episode-body'
            ];

            for (const selector of selectors) {
                const bodies = [...document.querySelectorAll(selector)];
                if (bodies.length > 0) {
                    return bodies;
                }
            }
        }

        return [];
    }

    function compressBlankLines() {
        for (const body of getNovelBodies()) {
            const paragraphs = [...body.querySelectorAll(':scope > p')];
            let blankCount = 0;

            for (const p of paragraphs) {
                if (isBlankParagraph(p)) {
                    blankCount++;

                    if (blankCount > KEEP_BLANK_LINES) {
                        p.remove();
                    }
                } else {
                    blankCount = 0;
                }
            }
        }
    }

    compressBlankLines();

    let timer = null;

    const observer = new MutationObserver(mutations => {
        let hasAddedNodes = false;

        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                hasAddedNodes = true;
                break;
            }
        }

        if (!hasAddedNodes) {
            return;
        }

        clearTimeout(timer);
        timer = setTimeout(compressBlankLines, 100);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
