import contextlib
import importlib.util
import io
import json
import math
import os
import re
import shutil
import subprocess
import sys
import traceback
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS

try:
    import cv2  # type: ignore
except Exception:
    cv2 = None

try:
    import imageio_ffmpeg  # type: ignore
except Exception:
    imageio_ffmpeg = None


app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent
LEGACY_SCRIPT_PATH = BASE_DIR / "analyze_video.py"
NEW_SCRIPT_CANDIDATES = [
    BASE_DIR / "pase_de_back_a_front.py",
    Path.home() / "Downloads" / "pase_de_back_a_front.py",
]
VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm"}
REQUIRED_PACKAGES = {
    "cv2": "opencv-python==4.8.0.74",
    "mediapipe": "mediapipe==0.10.14",
    "numpy": "numpy==1.26.4",
    "pandas": "pandas",
    "matplotlib": "matplotlib",
    "scipy": "scipy",
    "librosa": "librosa",
    "seaborn": "seaborn",
    "moviepy": "moviepy",
    "imageio_ffmpeg": "imageio-ffmpeg",
    "plotly": "plotly",
    "dtaidistance": "dtaidistance",
    "flask": "flask",
    "flask_cors": "flask-cors",
}
NEW_BACKEND_CACHE = {}


def normalize_filename(filename: str) -> str:
    base = os.path.basename(filename or "")
    base = base.replace("\ufffd", "_").replace(" ", "_")
    return re.sub(r"^pista_\d+_", "", base, flags=re.IGNORECASE)


def extract_metadata_from_filename(filename: str) -> dict:
    normalized = normalize_filename(filename)

    pattern_iso = r"(S\d+)_([A-Z]+)_ISO(\d+)_([A-Za-z]+\d+)"
    match_iso = re.search(pattern_iso, normalized)
    if match_iso:
        return {
            "sujeto": re.sub(r"\D", "", match_iso.group(1)),
            "mano": match_iso.group(2),
            "tipo_metronomo": "ISO",
            "bpm": int(match_iso.group(3)),
            "medicion": re.sub(r"\D", "", match_iso.group(4)),
        }

    pattern_pa = r"(S\d+)_([A-Z]+)_(PA)([+\-_]\d+)%?_{1,2}(\d+)-(\d+)_([A-Za-z]+\d+)"
    match_pa = re.search(pattern_pa, normalized)
    if match_pa:
        porcentaje_cambio = int(
            match_pa.group(4).replace("_", "+") if match_pa.group(4).startswith("_") else match_pa.group(4)
        )
        bpm_2 = 120 * (1 + porcentaje_cambio / 100)
        return {
            "sujeto": re.sub(r"\D", "", match_pa.group(1)),
            "mano": match_pa.group(2),
            "tipo_metronomo": "PA",
            "porcentaje_cambio": porcentaje_cambio,
            "bpm_1": 120,
            "bpm_2": round(bpm_2),
            "clics_1": int(match_pa.group(5)),
            "clics_2": int(match_pa.group(6)),
            "medicion": re.sub(r"\D", "", match_pa.group(7)),
        }

    pattern_pr = r"(S\d+)_([A-Z]+)_(PR)([+\-_]\d+)%?_{1,2}(\d+)-(\d+)-(\d+)-([A-Za-z]+\d+)"
    match_pr = re.search(pattern_pr, normalized)
    if match_pr:
        porcentaje_cambio = int(
            match_pr.group(4).replace("_", "+") if match_pr.group(4).startswith("_") else match_pr.group(4)
        )
        bpm_2 = 120 * (1 + porcentaje_cambio / 100)
        return {
            "sujeto": re.sub(r"\D", "", match_pr.group(1)),
            "mano": match_pr.group(2),
            "tipo_metronomo": "PR",
            "porcentaje_cambio": porcentaje_cambio,
            "bpm_1": 120,
            "bpm_2": round(bpm_2),
            "clics_1": int(match_pr.group(5)),
            "clics_rampa": int(match_pr.group(6)),
            "clics_2": int(match_pr.group(7)),
            "medicion": re.sub(r"\D", "", match_pr.group(8)),
        }

    return {}


def inspect_video(path: Path) -> dict:
    stat = path.stat()
    result = {
        "archivo": path.name,
        "ruta_video": str(path.resolve()),
        "tamano_bytes": stat.st_size,
        "tamano_mb": round(stat.st_size / (1024 * 1024), 2),
    }

    if cv2 is None:
        result["video"] = {
            "fps": None,
            "frames": None,
            "duracion_segundos": None,
            "resolucion": None,
        }
        return result

    capture = cv2.VideoCapture(str(path))
    if capture.isOpened():
        fps = float(capture.get(cv2.CAP_PROP_FPS) or 0)
        frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
        height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
        duration_seconds = round(frame_count / fps, 3) if fps > 0 else None
        result["video"] = {
            "fps": round(fps, 3) if fps > 0 else None,
            "frames": frame_count,
            "duracion_segundos": duration_seconds,
            "resolucion": {"ancho": width, "alto": height},
        }
    else:
        result["video"] = {
            "fps": None,
            "frames": None,
            "duracion_segundos": None,
            "resolucion": None,
        }
    capture.release()
    return result


def get_missing_packages():
    missing = []
    for module_name, package_name in REQUIRED_PACKAGES.items():
        if importlib.util.find_spec(module_name) is None:
            missing.append({"module": module_name, "package": package_name})
    return missing


def clean_output_dir(output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    for child in output_dir.iterdir():
        if child.is_dir():
            shutil.rmtree(child)
        else:
            child.unlink()


def resolve_new_backend_script() -> Path:
    for candidate in NEW_SCRIPT_CANDIDATES:
        if candidate.exists():
            return candidate
    searched = ", ".join(str(path) for path in NEW_SCRIPT_CANDIDATES)
    raise FileNotFoundError(
        f"No se encontro el backend nuevo 'pase_de_back_a_front.py'. Buscado en: {searched}"
    )


def sanitize_new_backend_source(source: str) -> str:
    cleaned_lines = []
    for line in source.splitlines():
        stripped = line.lstrip()
        if stripped.startswith("!"):
            continue
        if stripped.startswith("from IPython.display import"):
            continue
        if stripped.startswith("import seaborn as sns"):
            continue
        upper_line = line.upper()
        if (
            "GRAFICOS DE CUANTIFICADORES" in upper_line
            or "GRÁFICOS DE CUANTIFICADORES" in upper_line
            or stripped.startswith("if 'ULTIMO_ANALISIS_RAW' not in globals()")
            or stripped.startswith('if "ULTIMO_ANALISIS_RAW" not in globals()')
        ):
            break
        cleaned_lines.append(line)
    sanitized = "\n".join(cleaned_lines) + "\n"

    model_path = (BASE_DIR / "hand_landmarker.task").resolve()
    if model_path.exists():
        sanitized = sanitized.replace(
            "model_asset_path='hand_landmarker.task'",
            f"model_asset_path={repr(str(model_path))}",
        )
        sanitized = sanitized.replace(
            'model_asset_path="hand_landmarker.task"',
            f"model_asset_path={repr(str(model_path))}",
        )
    return sanitized


def load_new_backend_namespace(script_path: Path):
    cache_key = str(script_path.resolve())
    mtime = script_path.stat().st_mtime
    cached = NEW_BACKEND_CACHE.get(cache_key)
    if cached and cached.get("mtime") == mtime:
        return cached["namespace"]

    source = script_path.read_text(encoding="utf-8-sig", errors="replace").lstrip("\ufeff")
    sanitized = sanitize_new_backend_source(source)
    namespace = {
        "__name__": "pase_de_back_a_front_runtime",
        "__file__": str(script_path.resolve()),
    }
    exec(compile(sanitized, str(script_path), "exec"), namespace, namespace)
    patch_new_backend_namespace(namespace)
    NEW_BACKEND_CACHE[cache_key] = {"mtime": mtime, "namespace": namespace}
    return namespace


def resolve_ffmpeg_executable() -> str | None:
    if imageio_ffmpeg is None:
        return None
    try:
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return None


def resolve_ffprobe_executable(ffmpeg_exe: str | None = None) -> str | None:
    candidates = []
    if ffmpeg_exe:
        ffmpeg_path = Path(ffmpeg_exe)
        sibling = ffmpeg_path.with_name("ffprobe.exe" if os.name == "nt" else "ffprobe")
        candidates.append(sibling)
    for candidate in candidates:
        if candidate.exists():
            return str(candidate)
    return shutil.which("ffprobe")


def patch_new_backend_namespace(namespace) -> None:
    ffmpeg_exe = resolve_ffmpeg_executable()
    ffprobe_exe = resolve_ffprobe_executable(ffmpeg_exe)

    if ffmpeg_exe:
        namespace["FFMPEG_CMD"] = ffmpeg_exe
    if ffprobe_exe:
        namespace["FFPROBE_CMD"] = ffprobe_exe

    model_path = namespace.get("HAND_LANDMARKER_MODEL_PATH")
    if model_path and not Path(model_path).exists():
        raise FileNotFoundError(
            2,
            "No se encontro el modelo hand_landmarker.task requerido por el backend nuevo.",
            str(model_path),
        )

    backend_subprocess = namespace.get("subprocess")
    if backend_subprocess is not None:
        class SubprocessProxy:
            def __init__(self, module):
                self._module = module

            def __getattr__(self, name):
                return getattr(self._module, name)

            def run(self, cmd, *args, **kwargs):
                try:
                    return self._module.run(cmd, *args, **kwargs)
                except FileNotFoundError as exc:
                    command_repr = cmd if isinstance(cmd, str) else " ".join(str(part) for part in (cmd or []))
                    missing_target = getattr(exc, "filename", None) or command_repr or "desconocido"
                    raise FileNotFoundError(
                        2,
                        f"No se encontro el archivo o ejecutable requerido por el backend nuevo. Comando: {command_repr}",
                        str(missing_target),
                    ) from exc

        namespace["subprocess"] = SubprocessProxy(backend_subprocess)

    if not ffmpeg_exe:
        return

    original_load_audio = namespace.get("_cargar_audio_de_video")
    if callable(original_load_audio):
        def wrapped_cargar_audio_de_video(video_path):
            try:
                return original_load_audio(video_path)
            except Exception as exc:
                librosa_mod = namespace.get("librosa")
                np_mod = namespace.get("np")
                if librosa_mod is None:
                    raise
                output_dir = namespace.get("OUTPUT_DIR") or str(BASE_DIR / "analysis_outputs")
                os.makedirs(output_dir, exist_ok=True)
                video_stem = Path(str(video_path)).stem or "video"
                tmp_wav = os.path.join(output_dir, f"_{video_stem}_audio_extraido.wav")
                cmd = [
                    ffmpeg_exe,
                    "-y",
                    "-i",
                    str(video_path),
                    "-vn",
                    "-ac",
                    "1",
                    "-acodec",
                    "pcm_s16le",
                    tmp_wav,
                ]
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    encoding="utf-8",
                    errors="replace",
                )
                if result.returncode != 0:
                    raise
                audio_data, sample_rate = librosa_mod.load(tmp_wav, sr=None, mono=True)
                if np_mod is not None:
                    offset_getter = namespace.get("_obtener_offset_audio_stream")
                    offset_s = 0.0
                    if callable(offset_getter):
                        try:
                            offset_s = float(offset_getter(video_path) or 0.0)
                        except Exception:
                            offset_s = 0.0
                    if offset_s > 0.001:
                        n_padding = int(round(offset_s * sample_rate))
                        audio_data = np_mod.concatenate([np_mod.zeros(n_padding, dtype=audio_data.dtype), audio_data])
                return audio_data, sample_rate

        namespace["_cargar_audio_de_video"] = wrapped_cargar_audio_de_video

    namespace["_obtener_offset_audio_stream"] = lambda _video_path: 0.0


def find_audio_segment(label: str, bpm, audio_segments):
    bpm_number = None
    try:
        bpm_number = int(round(float(bpm)))
    except Exception:
        bpm_number = None

    for segment in audio_segments:
        if not isinstance(segment, dict):
            continue
        seg_bpm = segment.get("bpm")
        try:
            seg_bpm = int(round(float(seg_bpm)))
        except Exception:
            pass
        if bpm_number is not None and seg_bpm == bpm_number:
            return segment
        if str(segment.get("label") or "").strip().lower() == str(label or "").strip().lower():
            return segment
    return None


def make_json_safe(value):
    if isinstance(value, dict):
        return {str(key): make_json_safe(item) for key, item in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [make_json_safe(item) for item in value]
    if isinstance(value, Path):
        return str(value)
    if isinstance(value, float):
        return value if math.isfinite(value) else None
    if isinstance(value, (str, int, bool)) or value is None:
        return value

    if hasattr(value, "tolist"):
        try:
            return make_json_safe(value.tolist())
        except Exception:
            pass

    if hasattr(value, "item"):
        try:
            return make_json_safe(value.item())
        except Exception:
            pass

    return str(value)


def validate_iso_track_match(raw_result_safe: dict) -> None:
    metadata = raw_result_safe.get("metadata") or {}
    if str(metadata.get("tipo_metronomo") or "").strip().upper() != "ISO":
        return

    try:
        expected_bpm = float(metadata.get("bpm"))
    except Exception:
        return

    cuantificadores = raw_result_safe.get("cuantificadores") or {}
    variabilidad = cuantificadores.get("variabilidad_dinamica") or {}
    frecuencia = variabilidad.get("frecuencia_dominante") or {}
    stats_iti_video = raw_result_safe.get("stats_iti_video") or {}

    observed_bpm = frecuencia.get("bpm_efectivo")
    observed_n = frecuencia.get("n")
    observed_std_ms = stats_iti_video.get("std_ms")

    if observed_bpm is None:
        mean_dev_ms = stats_iti_video.get("mean_ms")
        if mean_dev_ms is not None:
            try:
                observed_iti_ms = (60000.0 / expected_bpm) + float(mean_dev_ms)
                if observed_iti_ms > 0:
                    observed_bpm = round(60000.0 / observed_iti_ms, 2)
                    observed_n = observed_n or stats_iti_video.get("n")
            except Exception:
                observed_bpm = None

    if observed_bpm is None:
        return

    try:
        observed_bpm = float(observed_bpm)
    except Exception:
        return

    try:
        observed_n = int(observed_n or 0)
    except Exception:
        observed_n = 0

    try:
        observed_std_ms = float(observed_std_ms) if observed_std_ms is not None else None
    except Exception:
        observed_std_ms = None

    if observed_n < 4:
        return

    diff_bpm = abs(observed_bpm - expected_bpm)
    diff_pct = (diff_bpm / expected_bpm) * 100 if expected_bpm else 0.0

    mismatch_is_clear = (
        diff_bpm >= 8
        and diff_pct >= 6
        and (observed_std_ms is None or observed_std_ms <= 120)
    )

    if mismatch_is_clear:
        raise RuntimeError(
            "El video parece corresponder a otra pista.\n"
            f"Pista esperada: ISO{int(round(expected_bpm))}.\n"
            f"Tempo detectado en el video: {observed_bpm:.2f} bpm.\n"
            f"Diferencia detectada: {diff_bpm:.2f} bpm."
        )


def build_manifest_from_new_backend(raw_result: dict, video_path: Path, metronome_path: Path, output_dir: Path) -> dict:
    raw_result_safe = make_json_safe(raw_result)
    validate_iso_track_match(raw_result_safe)
    metadata = raw_result_safe.get("metadata") or {}
    metricas_video = raw_result_safe.get("metricas_video") or {}
    stats_por_bpm = raw_result_safe.get("stats_por_bpm") or []
    tramos_audio = raw_result_safe.get("tramos_audio") or []

    tramos = []
    for segment in stats_por_bpm:
        if not isinstance(segment, dict):
            continue
        label = segment.get("label") or segment.get("nombre") or "Tramo"
        bpm = segment.get("bpm")
        audio_segment = find_audio_segment(label, bpm, tramos_audio) or {}
        asincronia_video = {
            "mean_ms": segment.get("mu_ms"),
            "std_ms": segment.get("sigma_ms"),
            "n": audio_segment.get("n_pareados"),
        }
        if len(stats_por_bpm) == 1 and raw_result_safe.get("stats_asincronia_video"):
            asincronia_video = raw_result_safe.get("stats_asincronia_video") or asincronia_video

        tramos.append(
            {
                "label": label,
                "bpm": bpm,
                "mu_ms": segment.get("mu_ms"),
                "sigma_ms": segment.get("sigma_ms"),
                "cv_pct": segment.get("cv_pct"),
                "tr_beats": segment.get("tr_beats"),
                "deriva_ms_s": segment.get("deriva_ms_s"),
                "deriva_r": segment.get("deriva_r"),
                "asincronia_video": asincronia_video,
                "asincronia_audio": audio_segment.get("asincronia_audio") or {},
                "iti_audio": audio_segment.get("iti_audio") or {},
                "n_tappeos_audio": audio_segment.get("n_tappeos"),
                "n_repetidos_audio": audio_segment.get("n_repetidos"),
            }
        )

    cuantificadores = {
        "temporal_basico": {
            "asincronia_video": raw_result_safe.get("stats_asincronia_video") or {},
            "iti_video": raw_result_safe.get("stats_iti_video") or {},
            "stats_por_bpm": stats_por_bpm,
        },
        "adaptativo": {
            "resultado_Tr_bpm1": raw_result_safe.get("resultado_Tr_bpm1") or {},
            "resultado_Tr_bpm2": raw_result_safe.get("resultado_Tr_bpm2") or {},
            "resultado_secciones": raw_result_safe.get("resultado_secciones") or {},
            "resultado_slope_rampa": raw_result_safe.get("resultado_slope_rampa") or {},
        },
        "integracion_track_audio": raw_result_safe.get("fusion_track_audio") or {},
    }

    raw_json_path = output_dir / "pase_de_back_a_front_resultado.json"
    raw_json_path.write_text(json.dumps(raw_result_safe, ensure_ascii=False, indent=2, allow_nan=False), encoding="utf-8")

    manifest = {
        "video_path": str(video_path.resolve()),
        "metronome_path": str(metronome_path.resolve()),
        "output_dir": str(output_dir.resolve()),
        "metadata": metadata,
        "metricas_video": metricas_video,
        "cuantificadores": cuantificadores,
        "tramos": tramos,
        "comparacion_metodos": raw_result_safe.get("fusion_track_audio") or {},
        "generated_files": [str(raw_json_path.resolve())],
        "generated_plots": [],
    }

    manifest_path = output_dir / "analysis_results.json"
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=4, allow_nan=False),
        encoding="utf-8",
    )
    return manifest


def run_new_backend_analysis(video_path: Path, metronome_path: Path, output_dir: Path, metadata_override: dict | None = None):
    script_path = resolve_new_backend_script()
    clean_output_dir(output_dir)
    namespace = load_new_backend_namespace(script_path)
    run_analysis = namespace.get("run_analysis")
    if not callable(run_analysis):
        raise RuntimeError("El backend nuevo no expone una funcion callable 'run_analysis'.")

    original_extract_metadata = namespace.get("_extraer_metadata")
    override_metadata = metadata_override or {}
    if override_metadata and callable(original_extract_metadata):
        def forced_extract_metadata(_filename):
            return dict(override_metadata)

        namespace["_extraer_metadata"] = forced_extract_metadata

    stdout_buffer = io.StringIO()
    stderr_buffer = io.StringIO()
    try:
        with contextlib.redirect_stdout(stdout_buffer), contextlib.redirect_stderr(stderr_buffer):
            previous_cwd = os.getcwd()
            try:
                os.chdir(str(BASE_DIR))
                try:
                    raw_result = run_analysis(
                        video_path=str(video_path.resolve()),
                        metronome_path=str(metronome_path.resolve()),
                        config={
                            "OUTPUT_DIR": str(output_dir.resolve()),
                            "GRAFICAR": False,
                        },
                    )
                except FileNotFoundError as exc:
                    missing_target = getattr(exc, "filename", None) or str(exc)
                    raise RuntimeError(
                        "El backend nuevo no pudo completar el analisis porque falta un archivo o ejecutable.\n"
                        f"Faltante detectado: {missing_target}\n"
                        f"Detalle original: {exc}"
                    ) from exc
            finally:
                os.chdir(previous_cwd)
    finally:
        if override_metadata and callable(original_extract_metadata):
            namespace["_extraer_metadata"] = original_extract_metadata

    if not isinstance(raw_result, dict):
        raise RuntimeError("El backend nuevo termino sin devolver un diccionario de resultados.")

    manifest = build_manifest_from_new_backend(raw_result, video_path, metronome_path, output_dir)
    logs = {
        "stdout": stdout_buffer.getvalue(),
        "stderr": stderr_buffer.getvalue(),
    }
    return manifest, logs


def run_legacy_analysis(video_path: Path, metronome_path: Path, output_dir: Path):
    if not LEGACY_SCRIPT_PATH.exists():
        raise FileNotFoundError(f"No existe el script de analisis legado: {LEGACY_SCRIPT_PATH}")

    clean_output_dir(output_dir)

    env = os.environ.copy()
    env.update(
        {
            "ANALYSIS_VIDEO_PATH": str(video_path.resolve()),
            "ANALYSIS_METRONOME_PATH": str(metronome_path.resolve()),
            "ANALYSIS_OUTPUT_DIR": str(output_dir.resolve()),
            "ANALYSIS_INPUT_DIR": str(video_path.parent.resolve()),
            "ANALYSIS_SHOW_PLOTS": "0",
            "ANALYSIS_ENABLE_SOURCE_SEPARATION": "0",
            "PYTHONIOENCODING": "utf-8",
            "PYTHONUTF8": "1",
        }
    )

    process = subprocess.run(
        [sys.executable, str(LEGACY_SCRIPT_PATH)],
        cwd=str(BASE_DIR),
        env=env,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )

    manifest_path = output_dir / "analysis_results.json"
    if not manifest_path.exists():
        stdout_tail = process.stdout[-2500:] if process.stdout else ""
        stderr_tail = process.stderr[-2500:] if process.stderr else ""
        if process.returncode != 0:
            raise RuntimeError(
                "El script de analisis legado fallo.\n"
                f"STDOUT (final):\n{stdout_tail}\n\nSTDERR (final):\n{stderr_tail}"
            )
        raise RuntimeError(
            "El script legado termino pero no genero analysis_results.json.\n"
            f"STDOUT (final):\n{stdout_tail}\n\nSTDERR (final):\n{stderr_tail}"
        )

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    logs = {
        "stdout": process.stdout,
        "stderr": process.stderr,
    }
    if process.returncode != 0:
        logs["warning"] = (
            "El script legado devolvio un codigo de salida no exitoso, "
            "pero genero analysis_results.json y se utilizara ese resultado."
        )
    return manifest, logs


def run_real_analysis(video_path: Path, metronome_path: Path, output_dir: Path, metadata_override: dict | None = None):
    return run_new_backend_analysis(video_path, metronome_path, output_dir, metadata_override=metadata_override)


@app.get("/health")
def health():
    return jsonify({"status": "ok", "backend": "python"})


@app.post("/analizar")
def analizar():
    try:
        datos = request.get_json(silent=True) or {}
        ruta_video = datos.get("ruta_video")
        ruta_audio_metronomo = datos.get("ruta_audio_metronomo")
        nombre_archivo = datos.get("nombre_archivo")
        output_dir_raw = datos.get("output_dir")

        if not ruta_video:
            return jsonify({"status": "error", "message": "Falta 'ruta_video' en la peticion."}), 400
        if not ruta_audio_metronomo:
            return jsonify({"status": "error", "message": "Falta 'ruta_audio_metronomo' en la peticion."}), 400

        video_path = Path(ruta_video)
        metronome_path = Path(ruta_audio_metronomo)
        output_dir = Path(output_dir_raw) if output_dir_raw else (BASE_DIR / "analysis_outputs" / video_path.stem)

        if not video_path.exists():
            return jsonify({"status": "error", "message": f"No existe el video: {video_path}"}), 404
        if not metronome_path.exists():
            return jsonify({"status": "error", "message": f"No existe el audio del metronomo: {metronome_path}"}), 404
        if video_path.suffix.lower() not in VIDEO_EXTENSIONS:
            return jsonify(
                {"status": "error", "message": "El archivo recibido no tiene una extension de video soportada."}
            ), 400

        missing_packages = get_missing_packages()
        if missing_packages:
            paquetes = " ".join(item["package"] for item in missing_packages)
            return jsonify(
                {
                    "status": "error",
                    "message": (
                        "Faltan dependencias de Python para ejecutar el analisis real. "
                        f"Modulos ausentes: {', '.join(item['module'] for item in missing_packages)}."
                    ),
                    "missing_packages": missing_packages,
                    "install_command": f'"{sys.executable}" -m pip install -r "{BASE_DIR / "requirements-analisis.txt"}"',
                    "install_packages_command": f'"{sys.executable}" -m pip install {paquetes}',
                }
            ), 500

        inspection = inspect_video(video_path)
        metadata_override = extract_metadata_from_filename(nombre_archivo or video_path.name)
        manifest, logs = run_real_analysis(
            video_path,
            metronome_path,
            output_dir,
            metadata_override=metadata_override,
        )
        manifest = manifest or {}
        logs = logs or {}
        stdout_preview = str(logs.get("stdout") or "")[-4000:]
        stderr_preview = str(logs.get("stderr") or "")[-4000:]

        return jsonify(
            {
                "status": "success",
                "mensaje": "Video procesado correctamente con el backend nuevo.",
                "archivo": video_path.name,
                "ruta_video": str(video_path.resolve()),
                "ruta_audio_metronomo": str(metronome_path.resolve()),
                "tamano_bytes": inspection["tamano_bytes"],
                "tamano_mb": inspection["tamano_mb"],
                "metadata_extraida": manifest.get("metadata")
                or extract_metadata_from_filename(nombre_archivo or video_path.name),
                "analisis": {
                    "motor": "pase_de_back_a_front",
                    "video": inspection["video"],
                    "output_dir": str(output_dir.resolve()),
                    "stdout_preview": stdout_preview,
                    "stderr_preview": stderr_preview,
                },
                "generated_files": manifest.get("generated_files", []),
                "graficos": manifest.get("generated_plots", []),
            }
        )
    except FileNotFoundError as error:
        return jsonify({"status": "error", "message": str(error)}), 404
    except RuntimeError as error:
        return jsonify({"status": "error", "message": str(error)}), 500
    except Exception as error:
        return jsonify(
            {
                "status": "error",
                "message": f"Error interno del analisis: {error}",
                "traceback": traceback.format_exc(),
            }
        ), 500


if __name__ == "__main__":
    port = int(os.environ.get("PYTHON_PORT", os.environ.get("PORT", "5000")))
    debug = os.environ.get("FLASK_DEBUG", "0").strip().lower() in {"1", "true", "yes", "on"}
    print(f"Servidor de Python activo en http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=debug)
