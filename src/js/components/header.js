function initHeader() {
    const header = document.querySelector('#header');

    let prev_scroll_position = 0;
    let last_known_scroll_position = 0;
    let ticking = false;
    const offset = 80;

    function toggleHeader(last_scroll_pos, prev_scroll_pos) {
        if (!header.classList.contains('header--freezed')) {
            if (last_scroll_pos > prev_scroll_pos) {
                // scrolled down
                header.classList.add('header--collapsed');
            } else {
                // scrolled up
                header.classList.remove('header--collapsed');
            }
            prev_scroll_position = last_known_scroll_position;
            if (last_known_scroll_position < offset) {
                header.classList.add('header--transparent');
            } else {
                header.classList.remove('header--transparent');
            }
        }
    }

    window.addEventListener('scroll', (ev) => {
        last_known_scroll_position = window.scrollY;

        if (!ticking) {
            window.requestAnimationFrame(function() {
                toggleHeader(last_known_scroll_position, prev_scroll_position);
                ticking = false;
            });

            ticking = true;
        }
    });
}

export default initHeader;