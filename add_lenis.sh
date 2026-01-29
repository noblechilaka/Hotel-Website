#!/bin/bash

LENIS_SCRIPT='    <!-- Lenis Smooth Scrolling -->
    <script src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.29/bundled/lenis.min.js"></script>'

LENIS_INIT='
    <!-- Lenis Smooth Scrolling Initialization -->
    <script>
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: '\''vertical'\'',
        gestureDirection: '\''vertical'\'',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
      });

      lenis.on('\''scroll'\'', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);

      document.querySelectorAll('\''a[href^="#"]'\'').forEach(anchor => {
        anchor.addEventListener('\''click'\'', function (e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('\''href'\''));
          if (target) {
            lenis.scrollTo(target, {
              offset: -100,
              duration: 1.2
            });
          }
        });
      });

      window.lenis = lenis;
    </script>'

for file in about.html booking.html contact.html dashboard.html room-details.html signup.html login.html confirmation.html; do
    if [ -f "/Users/mac/Desktop/EMILY HOTELS/$file" ]; then
        # Add Lenis script after ScrollTrigger
        if ! grep -q "lenis" "/Users/mac/Desktop/EMILY HOTELS/$file"; then
            sed -i '' "s|<script src=\"https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js\"></script>|<script src=\"https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js\"></script>\n    $LENIS_SCRIPT|" "/Users/mac/Desktop/EMILY HOTELS/$file"
            
            # Add initialization script before </body>
            if ! grep -q "window.lenis = lenis" "/Users/mac/Desktop/EMILY HOTELS/$file"; then
                sed -i '' "s|</script>\n  </body>|</script>$LENIS_INIT\n  </body>|" "/Users/mac/Desktop/EMILY HOTELS/$file"
            fi
            echo "Updated $file"
        fi
    fi
done

echo "Done!"
