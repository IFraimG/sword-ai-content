#!/usr/bin/env python3
"""
LLaVA 1.5 7B Local Server Runner
Model: llava-hf/llava-1.5-7b-hf

Run with:
  pip install transformers torch torchvision accelerate bitsandbytes flask pillow requests
  python server/llava_runner.py --port 8008
"""

import os
import sys
import argparse
from io import BytesIO
from PIL import Image
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

# Global model & processor references
processor = None
model = None
device = "cuda" if os.environ.get("USE_CUDA", "1") == "1" else "cpu"

def load_llava():
    global processor, model, device
    print(f"📦 Loading llava-hf/llava-1.5-7b-hf on {device}...")
    try:
        from transformers import AutoProcessor, LlavaForConditionalGeneration
        import torch

        model_id = "llava-hf/llava-1.5-7b-hf"
        processor = AutoProcessor.from_pretrained(model_id)

        if torch.cuda.is_available():
            device = "cuda"
            model = LlavaForConditionalGeneration.from_pretrained(
                model_id,
                torch_dtype=torch.float16,
                low_cpu_mem_usage=True,
                load_in_4bit=True,
            )
        else:
            device = "cpu"
            model = LlavaForConditionalGeneration.from_pretrained(
                model_id,
                torch_dtype=torch.float32,
                low_cpu_mem_usage=True,
            )
        print("✅ LLaVA 1.5 7B loaded successfully!")
    except Exception as e:
        print(f"⚠️ Warning: Could not initialize local PyTorch model directly: {e}")
        print("Model will use mock/fallback mode or Ollama integration.")

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "online",
        "model": "llava-hf/llava-1.5-7b-hf",
        "device": device,
        "loaded": model is not None,
    })

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json or {}
    image_url = data.get("image_url")
    user_prompt = data.get("prompt", "Describe the atmosphere of this video thumbnail.")
    title = data.get("title", "")

    if not image_url:
        return jsonify({"error": "image_url is required"}), 400

    try:
        # Fetch image
        resp = requests.get(image_url, timeout=10)
        image = Image.open(BytesIO(resp.content)).convert("RGB")

        if model is not None and processor is not None:
            import torch
            prompt_text = f"USER: <image>\nVideo title: {title}\n{user_prompt}\nASSISTANT:"
            inputs = processor(text=prompt_text, images=image, return_tensors="pt").to(device)

            with torch.no_grad():
                generate_ids = model.generate(**inputs, max_new_tokens=400, do_sample=True, temperature=0.7)

            output = processor.decode(generate_ids[0][2:], skip_special_tokens=True)
            clean_reply = output.replace(prompt_text, "").strip()

            return jsonify({
                "model": "llava-hf/llava-1.5-7b-hf",
                "reply": clean_reply,
            })
        else:
            return jsonify({
                "model": "llava-hf/llava-1.5-7b-hf (stub)",
                "reply": f"Превью видео «{title}» передает созерцательную атмосферу с мягкой светотенью и глубокой перспективой.",
            })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8008)
    parser.add_argument("--load-weights", action="store_true", help="Download and load PyTorch model weights")
    args = parser.parse_args()

    if args.load_weights:
        load_llava()

    print(f"🚀 LLaVA 1.5 7B runner listening on http://0.0.0.0:{args.port}")
    app.run(host="0.0.0.0", port=args.port)
