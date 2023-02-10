import {
  ActionIcon,
  AspectRatio,
  Card,
  Group,
  Image,
  Menu,
  Modal,
  Switch,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { Dropzone, FileWithPath, MIME_TYPES } from "@mantine/dropzone";
import {
  IconArrowsMove,
  IconDots,
  IconEdit,
  IconMovie,
  IconTrash,
  IconUpload,
  IconX,
} from "@tabler/icons";
import React, { useState } from "react";
import { Layout, Responsive, WidthProvider } from "react-grid-layout";

import { getPosters, patchPoster, postPoster } from "@/api/poster";
import { LetterboxdMovie, Movie, Poster, TmdbMovie } from "@/api/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parse } from "papaparse";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const MAX_FILE_SIZE = 3 * 1024 ** 2; // 5 MB
const ROW_HEIGHT = 75;
const MAX_COLS = 10;

const ResponsiveGridLayout = WidthProvider(Responsive);

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
  const queryClient = useQueryClient();
  const { data: posters } = useQuery<Poster[]>({
    queryKey: ["posters"],
    queryFn: getPosters,
  });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMovie, setModalMovie] = useState<TmdbMovie>();

  const postMutation = useMutation({
    mutationFn: postPoster,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posters"] });
    },
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, layout, movies }: PatchMutationParameters) =>
      patchPoster(id, { layout, movies }),
    onSuccess: () => {
      if (mainPoster) {
        queryClient.invalidateQueries({ queryKey: ["posters", mainPoster.id] });
      }
    },
  });

  const mainPoster = posters ? posters[0] : undefined;

  /**
   * Parse the first CSV file uploaded to the dropzone.
   *
   * @param {FileWithPath[]} files  list of files uploaded to dropzone
   */
  const parseCsv = (files: FileWithPath[]) => {
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

  /**
   * Save poster layout.
   *
   * @param {Layout[]} layout grid layouts
   */
  const savePosterLayout = (layout: Layout[]) => {
    if (mainPoster) {
      patchMutation.mutate({ id: mainPoster.id, layout });
    }
  };

  /**
   * Remove a movie from poster.
   *
   * @param {number} index index of movie to remove from poster
   */
  const removeMovie = (index: number) => {
    if (mainPoster) {
      const movies = mainPoster.movies;
      const layout = mainPoster.layout;
      movies.splice(index, 1);
      layout.splice(index, 1);

      patchMutation.mutate({ id: mainPoster.id, movies, layout });
    }
  };

  /**
   * Open modal for movie.
   *
   * @param {TmdbMovie} movie movie to display in modal
   */
  const openMovieModal = (movie: TmdbMovie) => {
    setModalMovie(movie);
    setIsModalOpen(true);
  };

  return (
    <>
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMovie?.title}
        size="auto"
      >
        {modalMovie && (
          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Card.Section>
              <Image
                width={600}
                src={`https://image.tmdb.org/t/p/original/${modalMovie.poster_path}`}
                alt={`${modalMovie.title} Image`}
              />
            </Card.Section>
          </Card>
        )}
      </Modal>
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
      <Switch
        label="Preview Mode"
        checked={isPreviewMode}
        onChange={(event) => setIsPreviewMode(event.currentTarget.checked)}
      />
      {mainPoster && (
        <ResponsiveGridLayout
          className="layout"
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          isDraggable={!isPreviewMode}
          isResizable={!isPreviewMode}
          draggableHandle=".drag-handle"
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
              {!isPreviewMode && (
                <Card.Section withBorder inheritPadding py="xs">
                  <Group position="apart">
                    <IconArrowsMove className="drag-handle"></IconArrowsMove>

                    <Menu withinPortal position="bottom-end" shadow="sm">
                      <Menu.Target>
                        <ActionIcon>
                          <IconDots />
                        </ActionIcon>
                      </Menu.Target>

                      <Menu.Dropdown>
                        <Menu.Item
                          icon={<IconEdit size={14} />}
                          onClick={() => openMovieModal(movie)}
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Item
                          icon={<IconTrash size={14} />}
                          onClick={() => removeMovie(index)}
                        >
                          Remove
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Card.Section>
              )}
              <Card.Section>
                <AspectRatio ratio={2 / 3} sx={{ maxWidth: 352 }} mx="auto">
                  <Image
                    src={`https://image.tmdb.org/t/p/original/${movie.poster_path}`}
                    alt={`${movie.title} Image`}
                  />
                </AspectRatio>
              </Card.Section>
            </Card>
          ))}
        </ResponsiveGridLayout>
      )}
    </>
  );
}
