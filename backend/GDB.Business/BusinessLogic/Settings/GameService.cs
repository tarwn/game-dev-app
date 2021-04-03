using GDB.Common;
using GDB.Common.Authorization;
using GDB.Common.BusinessLogic;
using GDB.Common.Context;
using GDB.Common.DTOs.Game;
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
        private IPersistence _persistence;

        public GameService(IBusinessServiceOperator busOp, IPersistence persistence)
        {
            _busOp = busOp;
            _persistence = persistence;
        }

        public async Task<GameDTO> CreateGameAsync(IAuthContext authContext)
        {
            return await _busOp.Operation<GameDTO>(async (p) => {
                var launchDate = Helper.GetUtcDate(DateTime.UtcNow.Year + 1, 1, 1);
                var game = new GameDTO(0, authContext.StudioId, "New Game", GameStatus.Idea, launchDate, "", true,
                    DateTime.UtcNow, authContext.UserId,
                    DateTime.UtcNow, authContext.UserId);
                return await p.Games.CreateAsync(game);
            });
        }

        public async Task DeleteGameAsync(int id, IAuthContext authContext)
        {
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
                game.UpdatedBy = authContext.UserId;
                game.UpdatedOn = DateTime.UtcNow;

                await p.Games.UpdateAsync(game);
            });
        }
    }
}
