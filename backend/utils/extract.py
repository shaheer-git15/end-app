import os
from moviepy import VideoFileClip
from pydub import AudioSegment

def extract_and_preprocess(video_path, output_dir="output"):
    os.makedirs(output_dir, exist_ok=True)

    
    raw_video_path = os.path.join(output_dir, "video_only.mp4")
    raw_audio_path = os.path.join(output_dir, "audio_original.wav")
    whisper_audio_path = os.path.join(output_dir, "audio_whisper_ready.wav")

  
    clip = VideoFileClip(video_path)

    
    clip.without_audio().write_videofile(raw_video_path, codec="libx264", audio=False)

   
    clip.audio.write_audiofile(raw_audio_path)

  
    audio = AudioSegment.from_file(raw_audio_path)
    audio = audio.set_frame_rate(16000).set_channels(1)  # 16 kHz, mono
    audio.export(whisper_audio_path, format="wav")

    clip.close()

    return whisper_audio_path, raw_video_path


if __name__ == "__main__":
    video_file = "sound_data_collection/G/G_First_letter_of_gp_03_004.mp4"  
    whisper_audio, video_only = extract_and_preprocess(video_file)

    print(f"✅ Whisper-ready audio saved at: {whisper_audio}")
    print(f"✅ Video without audio saved at: {video_only}")
