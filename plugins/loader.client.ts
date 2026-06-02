export default defineNuxtPlugin(() => {
  // Create loader HTML
  const loaderHTML = `
    <div id="app-loader" style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 99999;
      background: radial-gradient(ellipse at center, #0f0303 0%, #070101 70%);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    ">
      <div style="position: relative; z-index: 10; display: flex; flex-direction: column; align-items: center; gap: 2rem;">
        <img src="/white.png" alt="Loading" style="
          width: 220px;
          height: auto;
          filter: drop-shadow(0 0 30px rgba(255, 40, 40, 0.6));
          animation: logoFloat 3s ease-in-out infinite;
        " />
        <div style="
          width: 240px;
          height: 3px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 0 10px rgba(255, 40, 40, 0.3);
        ">
          <div style="
            height: 100%;
            background: linear-gradient(90deg, rgba(255, 50, 50, 0.8) 0%, rgba(255, 100, 100, 1) 50%, rgba(255, 50, 50, 0.8) 100%);
            border-radius: 10px;
            animation: progressGrow 2.5s ease-out forwards;
            box-shadow: 0 0 15px rgba(255, 50, 50, 0.8);
          "></div>
        </div>
      </div>
      <style>
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes progressGrow {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      </style>
    </div>
  `

  // Inject loader on client side
  if (process.client) {
    // Add loader to body immediately
    const loaderDiv = document.createElement('div')
    loaderDiv.innerHTML = loaderHTML
    document.body.appendChild(loaderDiv.firstElementChild!)

    // Remove loader after 2.5 seconds
    setTimeout(() => {
      const loader = document.getElementById('app-loader')
      if (loader) {
        loader.style.transition = 'opacity 0.5s ease'
        loader.style.opacity = '0'
        setTimeout(() => {
          loader.remove()
        }, 500)
      }
    }, 2500)
  }
})
