import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import ImageScript from "https://deno.land/x/imagescript@1.3.0/mod.ts";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

serve(async (req: Request) => {
  // OPTIONS 프리플라이트 요청 처리
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  const { record } = await req.json();
  const bucket = record.bucket_id;
  const filePath = record.name;

  // HEIC/HEIF 파일만 처리
  if (!filePath.match(/\.(heic|heif)$/i)) {
    return new Response("Not a HEIC/HEIF file, skipping.", { status: 200 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 파일 다운로드
  const { data, error } = await supabase.storage.from(bucket).download(filePath);
  if (error || !data) {
    return new Response("Download error", { status: 500 });
  }

  // image_script로 JPEG 변환
  const heicBuffer = await data.arrayBuffer();
  const image = await ImageScript.decode(heicBuffer); // HEIC 디코딩
  const jpegBuffer = await image.encodeJPEG(90);      // JPEG 인코딩

  // JPEG 업로드
  const jpegPath = filePath.replace(/\.(heic|heif)$/i, ".jpg");
  const { error: uploadError } = await supabase.storage.from(bucket).upload(jpegPath, jpegBuffer, {
    contentType: "image/jpeg",
    upsert: true,
  });
  if (uploadError) {
    return new Response("JPEG upload error", { status: 500 });
  }

  // 원본 삭제
  await supabase.storage.from(bucket).remove([filePath]);
  return new Response("Converted and uploaded JPEG", {
    status: 200,
    headers: corsHeaders(),
  });
});