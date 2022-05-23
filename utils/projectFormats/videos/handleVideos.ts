import FFMpeg from 'ffmpeg'
import Logger from '../../Logger'

/**
 * Create a thumbnail for a video.
 *
 * @param source The source video (path)
 * @param name Name of the video file, without ending
 * @param target The target destination (path)
 */
export async function createThumbnail(
  source: string,
  name: string,
  target: string
) {
  // Create FFMpeg instance with video
  let video
  try {
    video = await new FFMpeg(`${source}`)
  } catch (err) {
    new Logger().error(
      'FFMpeg: Build Process (FFMpeg)',
      'Extract Frames (thumbnail)',
      err
    )
    console.log(err)
    throw err
  }

  // Extract files
  try {
    const files = await video.fnExtractFrameToJPG(target, {
      start_time: 30,
      number: 1,
      file_name: `thumbnail_${name}_%t_%s.jpg`,
    })
    new Logger().event('FFMpeg', 'Extract Frame (thumbnail)', files)
  } catch (err) {
    new Logger().error(
      'FFMpeg: Extract Frames (JS error)',
      'Extract Frame (thumbnail)',
      err
    )
  }
}

/**
 * Creates preview images all 10 seconds and save them.
 *
 * IMPORTANT! Function is async! So should not be called somewhere where it could block the event loop!
 *
 * IMPORTANT! Will log errors to the console, so no need to do that.
 *
 * @param source The source video (path)
 * @param name Name of the video file, without ending
 * @param target The target destination folder (path)
 * @throws Error if the video object from source cannot be created or the target files cannot be created and saved.
 */
export async function createPreviews(
  source: string,
  name: string,
  target: string
) {
  // Create FFMpeg instance with video
  let video
  try {
    video = await new FFMpeg(`${source}`)
  } catch (err) {
    new Logger().error(
      'FFMpeg: Build Process (FFMpeg)',
      'Extract Frames (preview)',
      err
    )
    console.log(err)
    throw err
  }

  // Extract files
  try {
    const files = await video.fnExtractFrameToJPG(target, {
      number: video.metadata.duration
        ? // https://stackoverflow.com/questions/3019278/how-can-i-specify-the-base-for-math-log-in-javascript: Change of Base Identity
          Math.round(
            Math.log(Math.pow(video.metadata.duration?.seconds, 2) / 50000) /
              Math.log(1.2)
          )
        : 50,
      size: '144x?',
      file_name: `preview_${name}_%t_%s.jpg`,
    })
    new Logger().event('FFMpeg', 'Extract Frames (previews)', files)
  } catch (err) {
    new Logger().error('FFMpeg: Execute', 'Extract Frames (previews)', err)
    throw err
  }
}
