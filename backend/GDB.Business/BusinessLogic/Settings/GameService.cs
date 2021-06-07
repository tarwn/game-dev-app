using GDB.Common;
using GDB.Common.Authorization;
using GDB.Common.BusinessLogic;
using GDB.Common.Context;
using GDB.Common.DTOs.Game;
using GDB.Common.DTOs.Studio;
using GDB.Common.Persistence;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Business.BusinessLogic.Settings
{
    public class GameService: IGameService
    {
        private IBusinessServiceOperator _busOp;

        public GameService(IBusinessServiceOperator busOp)
        {
            _busOp = busOp;
        }

        public async Task<GameDTO> CreateGameAsync(IAuthContext authContext)
        {
            if (authContext.Role != StudioUserRole.Administrator)
            {
                throw new AuthorizationDeniedException("Only administrators can create new games", $"Authorization error: {authContext.UserId} attempted to CreateGameAsync and is currently Role {authContext.Role}");
            }

            return await _busOp.Operation<GameDTO>(async (p) => {
                var launchDate = Helper.GetUtcDate(DateTime.UtcNow.Year + 1, 1, 1);
                var game = new GameDTO(0, authContext.StudioId, "New Game", GameStatus.Idea, launchDate, "", true,
                    DateTime.UtcNow, authContext.UserId,
                    DateTime.UtcNow, authContext.UserId);
                var createdGame = await p.Games.CreateAsync(game);

                // and now initial tasks
                await p.Tasks.CreateInitialTasksAsync(createdGame.Id, authContext.UserId, DateTime.UtcNow);

                return createdGame;
            });
        }

        public async Task DeleteGameAsync(int id, IAuthContext authContext)
        {
            if (authContext.Role != StudioUserRole.Administrator)
            {
                throw new AuthorizationDeniedException("Only administrators can delete games", $"Authorization error: {authContext.UserId} attempted to DeleteGameAsync and is currently Role {authContext.Role}");
            }

            await _busOp.Operation(async (p) => {
                var game = await p.Games.GetByIdAsync(authContext.StudioId, id);
                if (game.BusinessModelLastUpdatedBy.HasValue || game.CashForecastLastUpdatedBy.HasValue ||
                    game.ComparablesLastUpdatedBy.HasValue || game.MarketingPlanLastUpdatedBy.HasValue)
                {
                    throw new AccessDeniedException("Cannot delete a game once planning has started", "User attempted to delete a game that had planning on it already");
                }

                await p.Games.DeleteAsync(id, DateTime.UtcNow, authContext.UserId);
            });
        }

        public async Task UpdateGameAsync(int id, UpdateGameDTO updateDto, IAuthContext authContext)
        {
            if (authContext.Role != StudioUserRole.Administrator)
            {
                throw new AuthorizationDeniedException("Only administrators can update top-level game settings", $"Authorization error: {authContext.UserId} attempted to UpdateGameAsync and is currently Role {authContext.Role}");
            }

            await _busOp.Operation(async (p) => {
                var game = await p.Games.GetByIdAsync(authContext.StudioId, id);
                if (updateDto.IsFavorite.HasValue)
                {
                    game.IsFavorite = updateDto.IsFavorite.Value;
                }
                if (updateDto.LaunchDate.HasValue)
                {
                    game.LaunchDate = updateDto.LaunchDate.Value;
                }
                if (!string.IsNullOrEmpty(updateDto.Name))
                {
                    game.Name = updateDto.Name;
                }
                if (updateDto.Status.HasValue)
                {
                    game.Status = updateDto.Status.Value;
                }
                if (updateDto.GoalsDocUrl != null)
                {
                    game.GoalsDocUrl = updateDto.GoalsDocUrl;
                }
                if (updateDto.GoalsNotes != null)
                {
                    game.GoalsNotes = updateDto.GoalsNotes;
                }
                if (updateDto.GroundworkDocUrl != null)
                {
                    game.GroundworkDocUrl = updateDto.GroundworkDocUrl;
                }
                if (updateDto.GroundworkNotes != null)
                {
                    game.GroundworkNotes = updateDto.GroundworkNotes;
                }
                game.UpdatedBy = authContext.UserId;
                game.UpdatedOn = DateTime.UtcNow;

                await p.Games.UpdateAsync(game);
            });
        }
    }
}
