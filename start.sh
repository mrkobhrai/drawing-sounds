if command -v gnome-terminal
then
  gnome-terminal -x sh -c "cd backend; ./venv.sh; ./run.sh"
  gnome-terminal -x sh -c "cd frontend; yarn install; yarn start"
elif command -v zsh
then
  osascript -e 'tell app "Terminal"
    do script "cd backend; ./venv.sh; ./run.sh"
  end tell'
  osascript -e 'tell app "Terminal"
      do script "cd frontend; yarn install; yarn start"
    end tell'
fi

