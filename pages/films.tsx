import {
  AspectRatio,
  Card,
  Group,
  Image,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { Dropzone, FileWithPath, MIME_TYPES } from "@mantine/dropzone";
import { IconMovie, IconUpload, IconX } from "@tabler/icons";
import React from "react";
import { Layout, Responsive, WidthProvider } from "react-grid-layout";

import { getPosters, patchPoster, postPoster } from "@/api/poster";
import { LetterboxdMovie, Movie, Poster, TmdbMovie } from "@/api/types";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { parse } from "papaparse";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const MAX_FILE_SIZE = 3 * 1024 ** 2; // 5 MB
const ROW_HEIGHT = 75;
const MAX_COLS = 10;

const ResponsiveGridLayout = WidthProvider(Responsive);
const queryClient = new QueryClient();

interface PatchMutationParameters {
  id: string;
  layout?: Layout[];
  movies?: TmdbMovie[];
}

/**
 * Clean dirty film from CSV parse to pristine film ready for API.
 *
 * @param {LetterboxdMovie} dirtyFilm dirty film parsed from CSV
 * @returns {Movie} cleaned film
 */
const cleanFilm = (dirtyFilm: LetterboxdMovie): Movie => {
  return Object.entries(dirtyFilm).reduce((acc, [key, value]) => {
    let cleanedKey = key.toLowerCase();

    // don't want to implement a camel case function for one string
    if (cleanedKey === "letterboxd uri") {
      cleanedKey = "letterboxdUri";
    }

    acc[cleanedKey] = value;

    return acc;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, {} as any) as Movie;
};

/**
 * Component for listing films
 *
 * @returns {React.ReactElement} react component
 */
export default function Films(): React.ReactElement {
  const theme = useMantineTheme();
  const { data: posters } = useQuery<Poster[]>({
    queryKey: ["posters"],
    queryFn: getPosters,
  });

  const mainPoster = posters ? posters[0] : undefined;
  console.log(mainPoster);

  const postMutation = useMutation({
    mutationFn: postPoster,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posters"] });
    },
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, layout }: PatchMutationParameters) =>
      patchPoster(id, { layout }),
    onSuccess: () => {
      if (mainPoster) {
        queryClient.invalidateQueries({ queryKey: ["posters", mainPoster.id] });
      }
    },
  });

  /**
   * Parse the first CSV file uploaded to the dropzone.
   *
   * @param {FileWithPath[]} files  list of files uploaded to dropzone
   */
  const parseCsv = (files: FileWithPath[]) => {
    console.log(files);
    const firstFile = files[0];

    parse(firstFile, {
      worker: true,
      header: true,
      complete: (results) => {
        const cleanedFilms = results.data.map((film) =>
          cleanFilm(film as LetterboxdMovie)
        );
        postMutation.mutate(cleanedFilms);
      },
    });
  };

  const savePosterLayout = (layout: Layout[]) => {
    if (mainPoster) {
      patchMutation.mutate({ id: mainPoster.id, layout });
    }
  };

  return (
    <>
      <Dropzone
        onDrop={(files) => parseCsv(files)}
        onReject={(files) => console.log("rejected files", files)}
        maxSize={MAX_FILE_SIZE}
        accept={[MIME_TYPES.csv]}
      >
        <Group
          position="center"
          spacing="xl"
          style={{ minHeight: 220, pointerEvents: "none" }}
        >
          <Dropzone.Accept>
            <IconUpload
              size={50}
              stroke={1.5}
              color={
                theme.colors[theme.primaryColor][
                  theme.colorScheme === "dark" ? 4 : 6
                ]
              }
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX
              size={50}
              stroke={1.5}
              color={theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]}
            />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconMovie size={50} stroke={1.5} />
          </Dropzone.Idle>

          <div>
            <Text size="xl" inline>
              Drag csv here or click to select files
            </Text>
            <Text size="sm" color="dimmed" inline mt={7}>
              Attach as many files as you like, each file should not exceed 5mb
            </Text>
          </div>
        </Group>
      </Dropzone>
      {mainPoster ? (
        <ResponsiveGridLayout
          className="layout"
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{
            lg: MAX_COLS,
            md: MAX_COLS,
            sm: MAX_COLS,
            xs: MAX_COLS,
            xxs: MAX_COLS,
          }}
          rowHeight={ROW_HEIGHT}
          layouts={{ lg: mainPoster.layout }}
          onLayoutChange={(currentLayout: Layout[]) =>
            savePosterLayout(currentLayout)
          }
        >
          {mainPoster.movies.map((movie, index) => (
            <Card key={index} shadow="sm" p="lg" radius="md" withBorder>
              <Card.Section>
                <AspectRatio ratio={2 / 3} sx={{ maxWidth: 352 }} mx="auto">
                  <Image
                    src={`https://image.tmdb.org/t/p/original/${movie.poster_path}`}
                    alt="Panda"
                  />
                </AspectRatio>
              </Card.Section>
            </Card>
          ))}
        </ResponsiveGridLayout>
      ) : (
        <></>
      )}
    </>
  );
}
