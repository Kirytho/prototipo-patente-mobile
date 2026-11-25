    const $ = (id) => document.getElementById(id);
    const readingMode = document.body.dataset.readingMode || "inline";

    function setReadingVisible(visible) {
      $("readingCard").hidden = !visible;
      document.body.classList.toggle("reading-open", visible);
      document.body.classList.toggle("sheet-open", visible && readingMode === "sheet");
    }
    function revealReading() {
      setReadingVisible(true);
      if (readingMode === "inline") $("readingCard").scrollIntoView({ behavior: "smooth", block: "start" });
    }
    const views = {
      capturar: $("vista-capturar"),
      bitacora: $("vista-bitacora"),
      adentro: $("vista-adentro")
    };
    const navButtons = [...document.querySelectorAll(".nav-button")];
    const formatTime = new Intl.DateTimeFormat("es-CL", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
    });

    const records = [
      { plate: "JDXT11", type: "entrada", when: new Date(2026, 10, 25, 10, 52), photo: true, duration: "Adentro" },
      { plate: "BBKL23", type: "salida", when: new Date(2026, 10, 25, 10, 36), photo: true, duration: "42 min" },
      { plate: "GTXD80", type: "entrada", when: new Date(2026, 10, 25, 10, 18), photo: false, duration: "Adentro" },
      { plate: "KPRR17", type: "salida", when: new Date(2026, 10, 25, 9, 57), photo: true, duration: "1 h 24 min" },
      { plate: "HLCV09", type: "entrada", when: new Date(2026, 10, 25, 9, 31), photo: true, duration: "Adentro" }
    ];

    const inside = [
      { plate: "JDXT11", type: "entrada", when: new Date(2026, 10, 25, 10, 52), photo: true, duration: "Adentro" },
      { plate: "GTXD80", type: "entrada", when: new Date(2026, 10, 25, 10, 18), photo: false, duration: "Adentro" },
      { plate: "HLCV09", type: "entrada", when: new Date(2026, 10, 25, 9, 31), photo: true, duration: "Adentro" }
    ];

    function announce(message) {
      $("liveRegion").textContent = "";
      window.setTimeout(() => { $("liveRegion").textContent = message; }, 30);
    }

    let toastTimer;
    function showToast(message) {
      const toast = $("toast");
      toast.textContent = message;
      toast.classList.add("show");
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
      announce(message);
    }

    function showView(name) {
      Object.entries(views).forEach(([key, view]) => { view.hidden = key !== name; });
      navButtons.forEach((button) => {
        if (button.dataset.view === name) button.setAttribute("aria-current", "page");
        else button.removeAttribute("aria-current");
      });
      window.scrollTo({ top: 0, behavior: "instant" });
    }

    navButtons.forEach((button) => {
      button.addEventListener("click", () => showView(button.dataset.view));
    });

    function createRecord(record) {
      const article = document.createElement("article");
      article.className = "record";

      const photo = document.createElement("div");
      photo.className = record.photo ? "record-photo" : "record-photo no-photo";
      photo.setAttribute("aria-hidden", "true");
      if (!record.photo) photo.textContent = "Sin foto";

      const main = document.createElement("div");
      main.className = "record-main";
      const plate = document.createElement("div");
      plate.className = "record-plate";
      plate.textContent = record.plate;
      const time = document.createElement("div");
      time.className = "record-time";
      time.textContent = formatTime.format(record.when);
      const meta = document.createElement("div");
      meta.className = "record-meta";
      meta.textContent = record.duration;
      main.append(plate, time, meta);

      const badge = document.createElement("span");
      badge.className = "badge " + record.type;
      badge.textContent = record.type === "entrada" ? "Entrada" : "Salida";
      article.append(photo, main, badge);
      return article;
    }

    function renderRecords(list, container, filter = "todos", query = "") {
      container.textContent = "";
      const normalized = query.trim().toUpperCase();
      const filtered = list.filter((record) => {
        const typeMatches = filter === "todos" || record.type === filter;
        const queryMatches = !normalized || record.plate.includes(normalized);
        return typeMatches && queryMatches;
      });
      if (!filtered.length) {
        const empty = document.createElement("div");
        empty.className = "empty";
        const title = document.createElement("strong");
        title.textContent = "Sin resultados";
        const body = document.createElement("span");
        body.textContent = "Prueba otra patente o cambia el filtro.";
        empty.append(title, body);
        container.appendChild(empty);
        return;
      }
      filtered.forEach((record) => container.appendChild(createRecord(record)));
    }

    let activeFilter = "todos";
    function renderBitacora() {
      renderRecords(records, $("listaBitacora"), activeFilter, $("buscar").value);
    }
    function renderAdentro() {
      renderRecords(inside, $("listaAdentro"));
    }

    document.querySelectorAll(".segment").forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.filter;
        document.querySelectorAll(".segment").forEach((item) => {
          item.setAttribute("aria-pressed", String(item === button));
        });
        renderBitacora();
      });
    });
    $("buscar").addEventListener("input", renderBitacora);
    $("btnRefrescar").addEventListener("click", () => {
      renderBitacora();
      $("freshness").textContent = "Actualizado ahora";
      showToast("Bitácora actualizada");
    });

    function beginRecognition(source) {
      const shell = $("cameraShell");
      shell.classList.add("scanning");
      $("cameraStatus").textContent = "Procesando";
      $("cameraHint").textContent = "Buscando la patente en la foto…";
      $("btnCamara").disabled = true;
      $("btnGaleria").disabled = true;
      announce("Procesando la fotografía");

      window.setTimeout(() => {
        shell.classList.remove("scanning");
        $("cameraStatus").textContent = "Lectura Lista";
        $("cameraHint").textContent = "Revisá la patente antes de confirmar";
        $("btnCamara").disabled = false;
        $("btnGaleria").disabled = false;
        revealReading();
        $("placaLeida").value = "JDXT11";
        $("placaLeida").focus({ preventScroll: true });
        announce("Lectura JDXT11 lista. Confirmá o corregila.");
        showToast(`${source}: lectura lista`);
      }, 900);
    }

    $("btnCamara").addEventListener("click", () => beginRecognition("Foto capturada"));
    $("btnGaleria").addEventListener("click", () => beginRecognition("Foto elegida"));
    $("placaLeida").addEventListener("input", (event) => {
      event.target.value = event.target.value.toUpperCase().replace(/\s+/g, "");
    });

    function resetCapture() {
      setReadingVisible(false);
      $("resultCard").hidden = true;
      document.body.classList.remove("result-open");
      $("cameraStatus").textContent = "Cámara Lista";
      $("cameraHint").textContent = "Mantén la patente dentro del recuadro";
      $("placaLeida").value = "JDXT11";
    }
    $("btnDescartar").addEventListener("click", () => {
      resetCapture();
      showToast("Lectura descartada");
    });

    $("btnConfirmar").addEventListener("click", () => {
      const plate = $("placaLeida").value.trim().toUpperCase();
      if (!plate) {
        $("placaLeida").focus();
        showToast("Escribe la patente antes de confirmar");
        return;
      }
      setReadingVisible(false);
      $("resultCard").hidden = false;
      document.body.classList.add("result-open");
      if (readingMode === "sheet") document.body.classList.add("sheet-open");
      $("resultType").textContent = "Entrada";
      $("resultPlate").textContent = plate;
      $("resultTime").textContent = formatTime.format(new Date());
      if (readingMode === "inline") $("resultCard").scrollIntoView({ behavior: "smooth", block: "start" });
      announce(`Entrada de ${plate} guardada`);
      showToast("Entrada guardada");
    });

    $("btnOtro").addEventListener("click", () => {
      resetCapture();
      $("btnCamara").focus();
    });

    const dialog = $("manualDialog");
    $("btnManual").addEventListener("click", () => {
      $("placaManual").value = "";
      dialog.showModal();
      window.setTimeout(() => $("placaManual").focus(), 50);
    });
    $("btnCerrarManual").addEventListener("click", () => dialog.close());
    $("placaManual").addEventListener("input", (event) => {
      event.target.value = event.target.value.toUpperCase().replace(/\s+/g, "");
    });
    $("manualForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const plate = $("placaManual").value.trim().toUpperCase();
      if (!plate) return;
      dialog.close();
      revealReading();
      $("placaLeida").value = plate;
      announce(`Patente ${plate} anotada. Revisá y confirmá.`);
      showToast("Patente anotada");
    });

    renderBitacora();
    renderAdentro();
