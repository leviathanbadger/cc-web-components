import '../../src';

const demoNum = document.getElementById('demo-number') as HTMLElement;
const display = document.getElementById('display') as HTMLElement;

demoNum?.addEventListener('change', () => {
    display.textContent = demoNum.getAttribute('value') ?? '';
});
