export default function initTabs() {
    const tabsInstance = document.querySelectorAll('.tabs');

    tabsInstance.forEach((instance) => {
        const el = instance.querySelectorAll('.tabs__el'),
            titles = instance.querySelectorAll('.tabs__el__title');

        for (let i = 1; i < el.length; i++) {
            el[i].querySelector('.tabs__el__content').style.maxHeight = '0';
        }

        titles.forEach((title) => {
            title.addEventListener('click', () => {
                const parent = title.closest('.tabs__el'),
                    content = parent.querySelector('.tabs__el__content');

                if (parent.classList.contains('active')) {
                    parent.classList.remove('active');

                    let height = content.getBoundingClientRect().height;

                    function animateHeightToNull() {
                        content.style.maxHeight = height + 'px';

                        requestAnimationFrame(function() {
                            content.style.maxHeight = 0 + 'px';
                        });
                    }
                    requestAnimationFrame(animateHeightToNull);
                } else {
                    parent.classList.add('active');
                    let height = content.scrollHeight;

                    function animateHeightToAuto() {
                        content.style.maxHeight = height + 'px';
                    }
                    requestAnimationFrame(animateHeightToAuto);
                }
            });
        });
    })
}